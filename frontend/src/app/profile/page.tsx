'use client';

import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Icon } from '@/components/ui/Icon';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="flex-1 bg-background-light dark:bg-background-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 shadow rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <div>
                 <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">User Profile</h3>
                 <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Personal details and application status.</p>
              </div>
               <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
                >
                  <Icon name="logout" className="text-[18px]" />
                  Sign Out
                </button>
            </div>
            {/* Body */}
            <div className="px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-slate-200 dark:sm:divide-slate-800">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Icon name="badge" className="text-[18px]" /> Full name
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2 font-medium">
                    {user?.firstName} {user?.lastName}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                       <Icon name="mail" className="text-[18px]" /> Email address
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                       <Icon name="admin_panel_settings" className="text-[18px]" /> Role
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                        {user?.role}
                     </span>
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                       <Icon name="confirmation_number" className="text-[18px]" /> Your Bookings
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900 dark:text-white sm:mt-0 sm:col-span-2">
                    <p className="text-slate-500 dark:text-slate-400 italic">Booking history integration pending.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
