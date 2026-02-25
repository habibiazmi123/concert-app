import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// ─── Configuration ──────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api';

// ─── Custom Metrics ─────────────────────────────────────────
const bookingEnqueued = new Counter('bookings_enqueued');
const bookingCompleted = new Counter('bookings_completed');
const bookingFailed = new Counter('bookings_failed');
const queueWaitTime = new Trend('queue_wait_time_ms');

// ─── Load Test Options ──────────────────────────────────────
export const options = {
  setupTimeout: '120s', // Allow enough time for user registration
  scenarios: {
    ticket_rush: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 10 },   // Warm up
        { duration: '10s', target: 30 },   // Ramp up
        { duration: '15s', target: 50 },   // Peak
        { duration: '10s', target: 50 },   // Sustain
        { duration: '5s', target: 0 },     // Cool down
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    bookings_enqueued: ['count>0'],
  },
};

// ─── Setup ──────────────────────────────────────────────────
export function setup() {
  // 1. Auto-discover concert and ticket type
  console.log('🔍 Fetching available concerts...');
  const concertsRes = http.get(`${BASE_URL}/concerts`);

  if (concertsRes.status !== 200) {
    console.error(`❌ Failed to fetch concerts (${concertsRes.status}). Is the backend running?`);
    return { error: true };
  }

  let concerts;
  try {
    const parsed = JSON.parse(concertsRes.body);
    // Handle both paginated { data: [...], meta } and plain array responses
    concerts = Array.isArray(parsed) ? parsed : parsed.data;
  } catch (e) {
    console.error('❌ Failed to parse concerts response');
    return { error: true };
  }

  // Find a published concert with available tickets
  const concert = concerts.find(
    (c) => c.status === 'PUBLISHED' && c.ticketTypes && c.ticketTypes.length > 0
  );

  if (!concert) {
    console.error('❌ No published concert with ticket types found!');
    return { error: true };
  }

  const ticketType = concert.ticketTypes.find((tt) => tt.availableSeats > 0);
  if (!ticketType) {
    console.error('❌ No ticket type with available seats found!');
    return { error: true };
  }

  console.log(`🎵 Concert: "${concert.title}" (${concert.id})`);
  console.log(`🎫 Ticket: "${ticketType.name}" — ${ticketType.availableSeats} seats @ ${ticketType.price}`);

  // 2. Register test users (just 30 — enough for our VU count)
  const tokens = [];
  const userCount = 30;

  console.log(`👥 Registering ${userCount} test users...`);
  for (let i = 0; i < userCount; i++) {
    const ts = Date.now();
    const email = `k6_${ts}_${i}@test.com`;
    const password = 'TestPass123!';

    const res = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify({ name: `K6 User ${i}`, email, password }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (res.status === 201 || res.status === 200) {
      try {
        const body = JSON.parse(res.body);
        if (body.accessToken) {
          tokens.push(body.accessToken);
        }
      } catch (e) { /* skip */ }
    }
  }

  console.log(`✅ Got ${tokens.length} authenticated users`);

  if (tokens.length === 0) {
    console.error('❌ No users registered. Check your auth endpoint.');
    return { error: true };
  }

  return {
    tokens,
    concertId: concert.id,
    ticketTypeId: ticketType.id,
  };
}

// ─── Main VU ────────────────────────────────────────────────
export default function (data) {
  if (data.error) return;

  const { tokens, concertId, ticketTypeId } = data;
  const token = tokens[__VU % tokens.length]; // Distribute tokens across VUs
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // ── Step 1: Enqueue booking ──
  const enqueueRes = http.post(
    `${BASE_URL}/bookings`,
    JSON.stringify({
      concertId,
      items: [{ ticketTypeId, quantity: 1 }],
    }),
    { headers }
  );

  const ok = check(enqueueRes, {
    'booking enqueued': (r) => r.status === 201 || r.status === 200,
  });

  if (!ok) {
    bookingFailed.add(1);
    sleep(1);
    return;
  }

  bookingEnqueued.add(1);

  let queueJobId;
  try {
    const body = JSON.parse(enqueueRes.body);
    queueJobId = body.queueJobId;
  } catch (e) {
    return;
  }

  if (!queueJobId) return;

  // ── Step 2: Poll queue status ──
  const startTime = Date.now();
  const maxWait = 60000;
  let status = 'WAITING';

  while (status !== 'COMPLETED' && status !== 'FAILED' && (Date.now() - startTime) < maxWait) {
    sleep(1);

    const statusRes = http.get(`${BASE_URL}/bookings/queue-status/${queueJobId}`, { headers });

    if (statusRes.status === 200) {
      try {
        const body = JSON.parse(statusRes.body);
        status = body.status;
      } catch (e) { /* keep polling */ }
    }
  }

  queueWaitTime.add(Date.now() - startTime);

  if (status === 'COMPLETED') {
    bookingCompleted.add(1);
  } else {
    bookingFailed.add(1);
  }

  sleep(Math.random() * 2 + 0.5);
}

// ─── Teardown ───────────────────────────────────────────────
export function teardown(data) {
  if (data.error) return;
  console.log('');
  console.log('🏁 Load test complete! Check metrics above.');
}
