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
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background min-h-[calc(100vh-130px)]">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl bg-accent/20 border-2 border-border-brutal mb-8 shadow-brutal">
          <Icon name="check_circle" className="text-6xl text-accent" fill />
        </div>

        <h1 className="text-4xl font-bold font-heading text-ink mb-4 tracking-tight">
          You&apos;re Going!
        </h1>

        <p className="text-lg text-ink-muted mb-8">
          Your payment was successful and your tickets are secured
          {booking?.concert?.title && <> for <span className="font-bold text-ink">{booking.concert.title}</span></>}
          . We&apos;ve sent a confirmation email with your ticket details.
        </p>

        {booking && (
          <div className="card-brutal-static p-6 mb-8 text-left">
            <h3 className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-4 border-b-2 border-border-brutal pb-2">
              Order Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Booking ID</dt>
                <dd className="font-mono text-ink font-bold text-right">{booking.id.slice(0, 12)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Date</dt>
                <dd className="text-ink font-bold">{booking.concert?.date ? formatDate(booking.concert.date) : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Tickets</dt>
                <dd className="text-ink font-bold">
                  {booking.items?.map((item) => `${item.quantity}x ${item.ticketType?.name || 'Ticket'}`).join(', ') || '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Total Paid</dt>
                <dd className="text-ink font-bold">Rp {booking.totalAmount?.toLocaleString('id-ID')}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/profile" className="btn-brutal btn-primary py-3 px-6 text-base">
            View Tickets
          </Link>
          <Link href="/" className="btn-brutal btn-ghost py-3 px-6 text-base">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
