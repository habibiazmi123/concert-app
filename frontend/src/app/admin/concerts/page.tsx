'use client';

import { Icon } from '@/components/ui/Icon';

export default function AdminConcertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Concerts & Events</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your events, artists, and venues.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
          <Icon name="add" className="text-lg" />
          Create Event
        </button>
      </div>

       <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
             Concert list and CRUD management interface pending integration with NestJS API.
          </div>
       </div>
    </div>
  );
}
