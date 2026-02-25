'use client';

import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
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

  return (
    <ProtectedRoute>
      <div className="flex-1 bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-brutal-static overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-border-brutal bg-surface-alt flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-heading text-ink">My Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-ink-muted">Personal details and booking history.</p>
              </div>
              <button
                onClick={() => logoutMutate()}
                className="btn-brutal btn-secondary text-sm py-2"
              >
                <Icon name="logout" className="text-lg" />
                Sign Out
              </button>
            </div>
            <div className="px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-border-brutal/30">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-bold text-ink-muted flex items-center gap-2">
                    <Icon name="badge" className="text-lg" /> Full name
                  </dt>
                  <dd className="mt-1 text-sm text-ink sm:mt-0 sm:col-span-2 font-bold">
                    {user?.name}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-bold text-ink-muted flex items-center gap-2">
                    <Icon name="mail" className="text-lg" /> Email address
                  </dt>
                  <dd className="mt-1 text-sm text-ink sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-bold text-ink-muted flex items-center gap-2">
                    <Icon name="admin_panel_settings" className="text-lg" /> Role
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <span className={`badge-brutal ${user?.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                      {user?.role}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 card-brutal-static overflow-hidden">
            <div className="px-6 py-5 border-b-2 border-border-brutal bg-surface-alt">
              <h3 className="text-lg font-bold font-heading text-ink flex items-center gap-2">
                <Icon name="confirmation_number" className="text-xl" /> Recent Bookings
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="event_busy" className="text-4xl text-ink-light mb-3" />
                  <p className="text-ink-muted font-medium">No bookings yet.</p>
                  <Link href="/concerts" className="text-primary hover:underline text-sm mt-2 inline-block font-bold">
                    Browse concerts
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border-2 border-border-brutal/30 rounded-xl hover:bg-surface-alt transition-colors">
                      <div className="flex-1">
                        <p className="font-bold text-ink">{booking.concert?.title || 'Concert'}</p>
                        <p className="text-sm text-ink-muted">
                          {formatDate(booking.createdAt)} &middot; Rp {booking.totalAmount?.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
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
