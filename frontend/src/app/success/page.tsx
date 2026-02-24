'use client';

import { Suspense } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useBooking } from '@/hooks/queries/useBookings';

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking } = useBooking(bookingId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark min-h-[calc(100vh-130px)]">
        <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-8 border-4 border-white dark:border-background-dark shadow-xl">
                <Icon name="check_circle" className="text-6xl text-green-500" fill />
            </div>
            
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                You&apos;re Going!
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Your payment was successful and your tickets are secured
                {booking?.concert?.title && <> for <span className="font-semibold text-slate-900 dark:text-white">{booking.concert.title}</span></>}
                . We&apos;ve sent a confirmation email with your ticket details.
            </p>

            {booking && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm text-left">
                 <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Order Details</h3>
                 <dl className="space-y-3 text-sm">
                     <div className="flex justify-between">
                         <dt className="text-slate-500 dark:text-slate-400">Booking ID</dt>
                         <dd className="font-mono text-slate-900 dark:text-white font-medium text-right">{booking.id.slice(0, 12)}...</dd>
                     </div>
                     <div className="flex justify-between">
                         <dt className="text-slate-500 dark:text-slate-400">Date</dt>
                         <dd className="text-slate-900 dark:text-white font-medium">{booking.concert?.date ? formatDate(booking.concert.date) : '—'}</dd>
                     </div>
                     <div className="flex justify-between">
                         <dt className="text-slate-500 dark:text-slate-400">Tickets</dt>
                         <dd className="text-slate-900 dark:text-white font-medium">
                           {booking.items?.map((item) => `${item.quantity}x ${item.ticketType?.name || 'Ticket'}`).join(', ') || '—'}
                         </dd>
                     </div>
                     <div className="flex justify-between">
                         <dt className="text-slate-500 dark:text-slate-400">Total Paid</dt>
                         <dd className="text-slate-900 dark:text-white font-medium">Rp {booking.totalAmount?.toLocaleString('id-ID')}</dd>
                     </div>
                 </dl>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link 
                    href="/profile"
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                     View Tickets
                 </Link>
                 <Link 
                    href="/"
                    className="inline-flex justify-center items-center px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                     Back to Home
                 </Link>
            </div>
        </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
