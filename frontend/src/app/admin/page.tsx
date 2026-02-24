'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 1245,
    activeConcerts: 8,
    totalRevenue: 145000,
    queueWaiters: 342
  });

  const [queueId] = useState(() => {
    // Check if window is defined to avoid SSR issues with Math.random
    if (typeof window !== 'undefined') {
        return `Q-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    }
    return '';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor your events, ticket sales, and active queues.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
          <Icon name="add" className="text-lg" />
          Create Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stats.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Icon name="payments" className="text-2xl text-green-600 dark:text-green-400" />
                </div>
             </div>
             <div className="mt-4 flex items-center text-sm">
                <Icon name="trending_up" className="text-green-500 text-[18px] mr-1" />
                <span className="text-green-500 font-medium">+12.5%</span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">from last month</span>
             </div>
          </div>

           <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Concerts</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.activeConcerts}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon name="stadium" className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
             </div>
             <div className="mt-4 flex items-center text-sm">
                <Icon name="sync" className="text-blue-500 text-[18px] mr-1" />
                <span className="text-slate-500 dark:text-slate-400 ml-2">2 upcoming in 7 days</span>
             </div>
          </div>

           <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tickets Sold</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalBookings.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Icon name="local_activity" className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
             </div>
             <div className="mt-4 flex items-center text-sm">
                <Icon name="trending_up" className="text-green-500 text-[18px] mr-1" />
                <span className="text-green-500 font-medium">+8.2%</span>
                <span className="text-slate-500 dark:text-slate-400 ml-2">from last month</span>
             </div>
          </div>

           <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Queue Waiters (Live)</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.queueWaiters}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center relative">
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    <Icon name="group" className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
             </div>
             <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">High demand in 1 queue</span>
             </div>
          </div>
      </div>

       {/* Recent Activity Table Placeholder */}
       <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-border-dark">
             <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Real-Time Bookings</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-border-dark">
             <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                Integration with WebSockets pending to show live booking stream.
             </div>
          </div>
       </div>
    </div>
  );
}
