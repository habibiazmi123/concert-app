'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AdminDashboardPage() {
  const [stats] = useState({
    totalBookings: 1245,
    activeConcerts: 8,
    totalRevenue: 145000,
    queueWaiters: 342,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Monitor your events, ticket sales, and active queues."
        action={
          <button className="btn-brutal btn-primary text-sm">
            <Icon name="add" className="text-lg" />
            Create Event
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="payments"
          label="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          sub="+12.5% from last month"
          color="bg-accent"
        />
        <StatCard
          icon="stadium"
          label="Active Concerts"
          value={stats.activeConcerts}
          sub="2 upcoming in 7 days"
          color="bg-primary"
        />
        <StatCard
          icon="local_activity"
          label="Tickets Sold"
          value={stats.totalBookings.toLocaleString()}
          sub="+8.2% from last month"
          color="bg-secondary"
        />
        <StatCard
          icon="group"
          label="Queue Waiters (Live)"
          value={stats.queueWaiters}
          sub="High demand in 1 queue"
          color="bg-accent-yellow"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card-brutal-static overflow-hidden">
        <div className="px-6 py-5 border-b-2 border-border-brutal">
          <h3 className="text-base font-bold font-heading text-ink">Real-Time Bookings</h3>
        </div>
        <div className="p-8 text-center text-ink-muted font-medium">
          Integration with WebSockets pending to show live booking stream.
        </div>
      </div>
    </div>
  );
}
