'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Icon } from '@/components/ui/Icon';
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
  WAITING: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: 'hourglass_top' },
  PROCESSING: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: 'sync' },
  COMPLETED: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: 'check_circle' },
  FAILED: { color: 'text-red-500', bg: 'bg-red-500/10', icon: 'error' },
};

function CountCard({ label, count, icon, color, bg }: {
  label: string; count: number; icon: string; color: string; bg: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-border-dark p-4 ${bg}`}>
      <div className="flex items-center gap-3">
        <Icon name={icon} className={`text-2xl ${color}`} />
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function LiveFeed({ events }: { events: QueueEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        <Icon name="wifi" className="text-4xl mb-2 opacity-50" />
        <p>Waiting for queue events...</p>
        <p className="text-xs mt-1">Events will appear here in real-time when bookings are processed.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
      {events.map((event, i) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.WAITING;
        return (
          <div
            key={`${event.jobId}-${event.status}-${i}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
              <Icon name={config.icon} className={`text-lg ${config.color} ${event.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                Job <span className="font-mono text-xs text-slate-500">{event.jobId?.slice(0, 8)}...</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {event.bookingId ? `Booking: ${event.bookingId.slice(0, 8)}...` : ''}
                {event.error ? `Error: ${event.error}` : ''}
              </p>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
              {event.status}
            </span>
            <span className="text-xs text-slate-400 shrink-0">
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
      ...prev.slice(0, 99), // Keep last 100 events
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

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('queue:update', (data: QueueEvent) => {
      addEvent(data);
    });

    socket.on('queue:counts', (data: QueueCounts) => {
      setLiveCounts(data);
    });

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Queue Monitor</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Live overview of BullMQ booking queue.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {connected ? 'Live' : 'Disconnected'}
          </span>
          {redis && !redis.error && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500">
              <Icon name="memory" className="text-sm" />
              Redis: {redis.usedMemory} · {redis.connectedClients} clients
            </span>
          )}
        </div>
      </div>

      {/* Queue Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <CountCard label="Waiting" count={counts.waiting} icon="hourglass_top" color="text-amber-500" bg="bg-white dark:bg-surface-dark" />
        <CountCard label="Processing" count={counts.processing} icon="sync" color="text-blue-500" bg="bg-white dark:bg-surface-dark" />
        <CountCard label="Completed" count={counts.completed} icon="check_circle" color="text-emerald-500" bg="bg-white dark:bg-surface-dark" />
        <CountCard label="Failed" count={counts.failed} icon="error" color="text-red-500" bg="bg-white dark:bg-surface-dark" />
        <CountCard label="Total Jobs" count={total} icon="list_alt" color="text-primary" bg="bg-white dark:bg-surface-dark" />
      </div>

      {/* Live Feed */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="stream" className="text-primary" />
            Live Feed
          </h3>
          {events.length > 0 && (
            <button
              onClick={() => setEvents([])}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <LiveFeed events={events} />
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-border-dark">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="history" className="text-slate-400" />
            Recent Queue Jobs
          </h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : recentJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">No queue jobs yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">User</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Concert</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => {
                  const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.WAITING;
                  return (
                    <tr key={job.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <Icon name={config.icon} className="text-sm" />
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{job.user.name}</p>
                          <p className="text-xs text-slate-500">{job.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{job.concert.title}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
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
