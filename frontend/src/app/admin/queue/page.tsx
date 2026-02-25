'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAdminQueueStatus } from '@/hooks/queries/useAdmin';

interface QueueEvent {
  jobId: string;
  status: string;
  position?: number | null;
  userId?: string;
  concertId?: string;
  bookingId?: string;
  error?: string;
  timestamp?: string;
}

interface QueueCounts {
  waiting: number;
  processing: number;
  completed: number;
  failed: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  WAITING: { color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', icon: 'hourglass_top' },
  PROCESSING: { color: 'text-primary', bg: 'bg-primary/10', icon: 'sync' },
  COMPLETED: { color: 'text-accent', bg: 'bg-accent/10', icon: 'check_circle' },
  FAILED: { color: 'text-secondary', bg: 'bg-secondary/10', icon: 'error' },
};

function CountCard({ label, count, icon, color, bg }: {
  label: string; count: number; icon: string; color: string; bg: string;
}) {
  return (
    <div className={`card-brutal-static p-4 ${bg}`}>
      <div className="flex items-center gap-3">
        <Icon name={icon} className={`text-2xl ${color}`} />
        <div>
          <p className="text-2xl font-bold font-heading text-ink">{count}</p>
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wide">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LiveFeed({ events }: { events: QueueEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-ink-muted">
        <Icon name="wifi" className="text-4xl mb-2 opacity-50" />
        <p className="font-medium">Waiting for queue events...</p>
        <p className="text-xs mt-1">Events will appear here in real-time when bookings are processed.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-brutal/20 max-h-[500px] overflow-y-auto">
      {events.map((event, i) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.WAITING;
        return (
          <div
            key={`${event.jobId}-${event.status}-${i}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt/50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg border-2 border-border-brutal/30 flex items-center justify-center ${config.bg}`}>
              <Icon name={config.icon} className={`text-lg ${config.color} ${event.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">
                Job <span className="font-mono text-xs text-ink-muted">{event.jobId?.slice(0, 8)}...</span>
              </p>
              <p className="text-xs text-ink-muted">
                {event.bookingId ? `Booking: ${event.bookingId.slice(0, 8)}...` : ''}
                {event.error ? `Error: ${event.error}` : ''}
              </p>
            </div>
            <span className={`badge-brutal text-xs ${config.bg} ${config.color}`}>
              {event.status}
            </span>
            <span className="text-xs text-ink-light shrink-0">
              {event.timestamp || 'now'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminQueuePage() {
  const { data: initialData, isLoading } = useAdminQueueStatus();
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<QueueEvent[]>([]);
  const [liveCounts, setLiveCounts] = useState<QueueCounts | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const addEvent = useCallback((event: QueueEvent) => {
    setEvents((prev) => [
      { ...event, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 99),
    ]);
  }, []);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const socket = io(`${wsUrl}/admin`, {
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('queue:update', (data: QueueEvent) => addEvent(data));
    socket.on('queue:counts', (data: QueueCounts) => setLiveCounts(data));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addEvent]);

  const counts = liveCounts || initialData?.counts || { waiting: 0, processing: 0, completed: 0, failed: 0 };
  const total = counts.waiting + counts.processing + counts.completed + counts.failed;
  const redis = initialData?.redis;
  const recentJobs = initialData?.recentJobs || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queue Monitor"
        subtitle="Live overview of BullMQ booking queue."
        action={
          <div className="flex items-center gap-2">
            <span className={`badge-brutal text-xs ${connected ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${connected ? 'bg-accent animate-pulse' : 'bg-secondary'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </span>
            {redis && !redis.error && (
              <span className="badge-brutal text-xs bg-primary/10 text-primary">
                <Icon name="memory" className="text-sm mr-1" />
                Redis: {redis.usedMemory} · {redis.connectedClients} clients
              </span>
            )}
          </div>
        }
      />

      {/* Queue Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <CountCard label="Waiting" count={counts.waiting} icon="hourglass_top" color="text-accent-yellow" bg="bg-accent-yellow/5" />
        <CountCard label="Processing" count={counts.processing} icon="sync" color="text-primary" bg="bg-primary/5" />
        <CountCard label="Completed" count={counts.completed} icon="check_circle" color="text-accent" bg="bg-accent/5" />
        <CountCard label="Failed" count={counts.failed} icon="error" color="text-secondary" bg="bg-secondary/5" />
        <CountCard label="Total Jobs" count={total} icon="list_alt" color="text-ink" bg="bg-surface-alt" />
      </div>

      {/* Live Feed */}
      <div className="card-brutal-static overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-border-brutal flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-ink flex items-center gap-2">
            <Icon name="stream" className="text-primary" />
            Live Feed
          </h3>
          {events.length > 0 && (
            <button onClick={() => setEvents([])} className="btn-brutal btn-ghost text-xs py-1 px-3">
              Clear
            </button>
          )}
        </div>
        <LiveFeed events={events} />
      </div>

      {/* Recent Jobs Table */}
      <div className="card-brutal-static overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-border-brutal">
          <h3 className="text-lg font-bold font-heading text-ink flex items-center gap-2">
            <Icon name="history" className="text-ink-muted" />
            Recent Queue Jobs
          </h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-ink-muted font-medium">Loading...</div>
        ) : recentJobs.length === 0 ? (
          <div className="p-8 text-center text-ink-muted font-medium">No queue jobs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border-brutal bg-surface-alt">
                  <th className="text-left py-3 px-4 font-bold text-ink uppercase text-xs tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-bold text-ink uppercase text-xs tracking-wider">User</th>
                  <th className="text-left py-3 px-4 font-bold text-ink uppercase text-xs tracking-wider">Concert</th>
                  <th className="text-left py-3 px-4 font-bold text-ink uppercase text-xs tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => {
                  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.WAITING;
                  return (
                    <tr key={job.id} className="border-b border-border-brutal/30 hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`badge-brutal text-xs ${config.bg} ${config.color}`}>
                          <Icon name={config.icon} className="text-sm mr-1" />
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-ink">{job.user.name}</p>
                          <p className="text-xs text-ink-muted">{job.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink-muted font-medium">{job.concert.title}</td>
                      <td className="py-3 px-4 text-ink-light text-xs">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
