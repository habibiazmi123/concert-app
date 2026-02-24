'use client';


export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure global application preferences.</p>
        </div>
      </div>

       <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
             Global settings form pending API implementation.
          </div>
       </div>
    </div>
  );
}
