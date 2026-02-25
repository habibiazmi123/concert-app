'use client';

import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { useAdminAnalytics } from '@/hooks/queries/useAdmin';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(yyyymm: string) {
  const [year, month] = yyyymm.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function RevenueChart({ data }: { data: { month: string; revenue: number; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-ink-muted font-medium">
        No revenue data yet.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const maxRevenue = Math.max(...sorted.map((d) => d.revenue), 1);

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold font-heading text-ink mb-6 flex items-center gap-2">
        <Icon name="trending_up" className="text-accent" />
        Revenue (Last 6 Months)
      </h3>
      <div className="space-y-3">
        {sorted.map((item) => {
          const pct = (item.revenue / maxRevenue) * 100;
          return (
            <div key={item.month} className="flex items-center gap-4">
              <span className="text-sm font-semibold text-ink-muted w-24 shrink-0">
                {formatMonth(item.month)}
              </span>
              <div className="flex-1 relative">
                <div className="h-8 bg-surface-alt border-2 border-border-brutal/20 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-500"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0 w-32">
                <span className="text-sm font-bold text-ink">
                  {formatCurrency(item.revenue)}
                </span>
                <span className="text-xs text-ink-light ml-1">({item.count})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopConcertsTable({
  concerts,
}: {
  concerts: {
    id: string;
    title: string;
    artist: string;
    venue: string;
    date: string;
    totalSeats: number;
    soldSeats: number;
    confirmedBookings: number;
  }[];
}) {
  if (concerts.length === 0) {
    return (
      <div className="p-8 text-center text-ink-muted font-medium">
        No concerts yet.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold font-heading text-ink mb-4 flex items-center gap-2">
        <Icon name="emoji_events" className="text-accent-yellow" />
        Top Concerts by Bookings
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border-brutal">
              <th className="text-left py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">#</th>
              <th className="text-left py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">Concert</th>
              <th className="text-left py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">Venue</th>
              <th className="text-left py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">Date</th>
              <th className="text-right py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">Sold</th>
              <th className="text-right py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">Fill Rate</th>
              <th className="text-right py-3 px-2 font-bold text-ink uppercase text-xs tracking-wider">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map((c, i) => {
              const fillRate = c.totalSeats > 0 ? (c.soldSeats / c.totalSeats) * 100 : 0;
              return (
                <tr
                  key={c.id}
                  className="border-b border-border-brutal/30 hover:bg-surface-alt/50 transition-colors"
                >
                  <td className="py-3 px-2 text-ink-light font-bold">{i + 1}</td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-bold text-ink">{c.title}</p>
                      <p className="text-xs text-ink-muted">{c.artist}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-ink-muted font-medium">{c.venue}</td>
                  <td className="py-3 px-2 text-ink-muted font-medium">
                    {new Date(c.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-bold text-ink">{c.soldSeats}</span>
                    <span className="text-ink-light">/{c.totalSeats}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-2 bg-surface-alt border border-border-brutal/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillRate > 80 ? 'bg-secondary' : fillRate > 50 ? 'bg-accent-yellow' : 'bg-accent'}`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink w-10">
                        {fillRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="badge-brutal bg-primary/10 text-primary">
                      {c.confirmedBookings}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" subtitle="Loading analytics data..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-brutal-static p-5 animate-pulse">
              <div className="h-11 w-11 bg-surface-alt border-2 border-border-brutal/30 rounded-xl mb-3" />
              <div className="h-6 w-24 bg-surface-alt rounded mb-2" />
              <div className="h-4 w-16 bg-surface-alt rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <div className="card-brutal-static p-8 text-center">
          <Icon name="error" className="text-4xl text-secondary mb-2" />
          <p className="text-ink-muted font-medium">Failed to load analytics data. Make sure you have admin access.</p>
        </div>
      </div>
    );
  }

  const { overview, revenueByMonth, topConcerts } = data;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Revenue reports and engagement metrics." />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="payments"
          label="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          sub={`${overview.recentBookings} bookings last 30 days`}
          color="bg-accent"
        />
        <StatCard
          icon="confirmation_number"
          label="Total Bookings"
          value={overview.totalBookings.toLocaleString()}
          sub={`${overview.confirmedBookings} confirmed`}
          color="bg-primary"
        />
        <StatCard
          icon="group"
          label="Total Users"
          value={overview.totalUsers.toLocaleString()}
          color="bg-secondary"
        />
        <StatCard
          icon="percent"
          label="Conversion Rate"
          value={overview.conversionRate}
          sub={`${overview.totalConcerts} concerts hosted`}
          color="bg-accent-yellow"
        />
      </div>

      {/* Revenue Chart */}
      <div className="card-brutal-static overflow-hidden">
        <RevenueChart data={revenueByMonth} />
      </div>

      {/* Top Concerts */}
      <div className="card-brutal-static overflow-hidden">
        <TopConcertsTable concerts={topConcerts} />
      </div>
    </div>
  );
}
