'use client';

import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
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

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon name={icon} className="text-xl text-white" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function RevenueChart({ data }: { data: { month: string; revenue: number; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No revenue data yet.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const maxRevenue = Math.max(...sorted.map((d) => d.revenue), 1);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Icon name="trending_up" className="text-emerald-500" />
        Revenue (Last 6 Months)
      </h3>
      <div className="space-y-3">
        {sorted.map((item) => {
          const pct = (item.revenue / maxRevenue) * 100;
          return (
            <div key={item.month} className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-24 shrink-0">
                {formatMonth(item.month)}
              </span>
              <div className="flex-1 relative">
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-lg transition-all duration-500"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0 w-32">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(item.revenue)}
                </span>
                <span className="text-xs text-slate-400 ml-1">({item.count})</span>
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
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        No concerts yet.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Icon name="emoji_events" className="text-amber-500" />
        Top Concerts by Bookings
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">#</th>
              <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">Concert</th>
              <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">Venue</th>
              <th className="text-left py-3 px-2 font-medium text-slate-500 dark:text-slate-400">Date</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500 dark:text-slate-400">Sold</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500 dark:text-slate-400">Fill Rate</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500 dark:text-slate-400">Bookings</th>
            </tr>
          </thead>
          <tbody>
            {concerts.map((c, i) => {
              const fillRate = c.totalSeats > 0 ? (c.soldSeats / c.totalSeats) * 100 : 0;
              return (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-2 text-slate-400">{i + 1}</td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{c.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.artist}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{c.venue}</td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-300">
                    {new Date(c.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="font-medium text-slate-900 dark:text-white">{c.soldSeats}</span>
                    <span className="text-slate-400">/{c.totalSeats}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillRate > 80 ? 'bg-red-500' : fillRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-10">
                        {fillRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
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
            <div key={i} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm animate-pulse">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3" />
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
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
        <div className="bg-white dark:bg-surface-dark border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <Icon name="error" className="text-4xl text-red-500 mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Failed to load analytics data. Make sure you have admin access.</p>
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
          color="bg-emerald-500"
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
          color="bg-violet-500"
        />
        <StatCard
          icon="percent"
          label="Conversion Rate"
          value={overview.conversionRate}
          sub={`${overview.totalConcerts} concerts hosted`}
          color="bg-amber-500"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
        <RevenueChart data={revenueByMonth} />
      </div>

      {/* Top Concerts */}
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
        <TopConcertsTable concerts={topConcerts} />
      </div>
    </div>
  );
}
