'use client';

import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Icon } from '@/components/ui/Icon';
import { useMyBookings } from '@/hooks/queries/useBookings';
import { useLogoutMutation } from '@/hooks/queries/useAuth';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { mutate: logoutMutate } = useLogoutMutation();
  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings({ limit: 5 });

  const bookings = bookingsData?.data ?? [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    EXPIRED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 bg-background-light dark:bg-background-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 shadow rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <div>
                 <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">User Profile</h3>
                 <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Personal details and booking history.</p>
              </div>
               <button
                  onClick={() => logoutMutate()}
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
                    {user?.name}
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
              </dl>
            </div>
          </div>

          {/* Booking History */}
          <div className="mt-8 bg-white dark:bg-slate-900 shadow rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="confirmation_number" className="text-[20px]" /> Recent Bookings
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="event_busy" className="text-4xl text-slate-400 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No bookings yet.</p>
                  <Link href="/concerts" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Browse concerts →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{booking.concert?.title || 'Concert'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(booking.createdAt)} · Rp {booking.totalAmount?.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || statusColors.EXPIRED}`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
