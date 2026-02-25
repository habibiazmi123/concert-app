'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBooking } from '@/hooks/queries/useBookings';
import { Icon } from '@/components/ui/Icon';

function PendingInstructionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking, isLoading } = useBooking(bookingId);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!booking) return;

    if (booking.status === 'CONFIRMED' || booking.payment?.status === 'COMPLETED') {
      router.push(`/success?bookingId=${bookingId}`);
      return;
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      router.push('/concerts');
      return;
    }

    if (!booking.payment?.providerMetadata) {
      if (booking.payment?.status === 'PENDING' && booking.payment?.method === 'CREDIT_CARD') {
        // Handle credit card edge cases or missing metadata
        router.push(`/checkout?bookingId=${bookingId}`);
      }
    }
  }, [booking, router, bookingId]);

  useEffect(() => {
    if (!booking?.expiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(booking.expiresAt!).getTime() - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft('Expired');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [booking?.expiresAt]);

  const instruction = booking?.payment?.providerMetadata;
  
  let vaNumber = 'Loading...';
  let bankName = '';

  if (instruction) {
    if (instruction.payment_type === 'echannel') {
      bankName = 'Mandiri';
      vaNumber = `Biller Code: ${instruction.biller_code}   Bill Key: ${instruction.bill_key}`;
    } else if (instruction.payment_type === 'permata') {
      bankName = 'Permata';
      vaNumber = instruction.permata_va_number || 'N/A';
    } else if (instruction.va_numbers && instruction.va_numbers.length > 0) {
      bankName = instruction.va_numbers[0].bank.toUpperCase();
      vaNumber = instruction.va_numbers[0].va_number;
    } else {
      vaNumber = 'Pending generation. Please wait.';
    }
  }

  if (isLoading || !booking || !instruction) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-brutal-static p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <Icon name="account_balance" className="text-6xl text-primary mb-4" />
          <h1 className="text-3xl font-bold font-heading text-ink mb-2">Complete Your Payment</h1>
          
          {timeLeft === 'Expired' ? (
            <p className="text-secondary font-bold mb-8">This booking has expired.</p>
          ) : (
            <p className="text-ink-muted mb-8">
              Please transfer the exact amount within{' '}
              <span className="font-bold text-secondary">{timeLeft}</span>
            </p>
          )}
          
          <div className="bg-surface border-2 border-border-brutal p-6 rounded-xl mb-8 flex flex-col items-center">
            <span className="text-sm font-bold text-ink-muted uppercase tracking-wider mb-1">{bankName} Virtual Account</span>
            <span className="text-3xl font-heading font-black text-ink select-all">{vaNumber}</span>
            <p className="mt-4 text-xs text-ink-muted">Transfer exactly: <span className="font-bold text-ink">Rp {booking.totalAmount.toLocaleString('id-ID')}</span></p>
          </div>

          <div className="bg-accent-yellow/20 border-2 border-accent-yellow/50 rounded-xl p-4 text-left mb-8 flex gap-3 text-sm text-ink-muted">
            <Icon name="info" className="text-accent-yellow shrink-0 text-xl" />
            <div>
              <p className="font-bold text-ink mb-1">Important Instructions</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Make sure to transfer using the selected bank channel.</li>
                <li>Your booking will be automatically confirmed once payment is detected.</li>
                <li>Do not close this page or your booking might time out if you haven't paid.</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 max-w-sm mx-auto">
            <button 
              onClick={() => router.push(`/success?bookingId=${bookingId}`)} 
              disabled={booking.status !== 'CONFIRMED'}
              className="btn-brutal btn-primary flex-1"
            >
              {booking.status === 'CONFIRMED' ? 'View Receipt' : 'Waiting for Payment...'}
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-brutal btn-ghost px-4"
              title="Refresh Status"
            >
              <Icon name="refresh" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingInstructionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
        </div>
      }
    >
      <PendingInstructionContent />
    </Suspense>
  );
}
