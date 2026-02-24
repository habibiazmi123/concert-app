'use client';

import { Icon } from '@/components/ui/Icon';

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Logs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review customer orders and payments.</p>
        </div>
      </div>

       <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
             Order history and transaction logs pending integration with NestJS API.
          </div>
       </div>
    </div>
  );
}
