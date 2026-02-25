'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Icon } from '@/components/ui/Icon';
import { useBooking } from '@/hooks/queries/useBookings';
import { useProcessPaymentMutation } from '@/hooks/queries/usePayments';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

declare global {
  interface Window {
    snap: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId);
  const processPayment = useProcessPaymentMutation();

  const [timeLeft, setTimeLeft] = useState('');

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

  const submitPayment = () => {
    processPayment.mutate(
      { bookingId },
      {
        onSuccess: (res) => {
          if (res.snapToken && window.snap) {
            window.snap.pay(res.snapToken, {
              onSuccess: function () {
                showSuccessToast('Payment successful!', 'Your tickets are confirmed');
                router.push(`/success?bookingId=${bookingId}`);
              },
              onPending: function () {
                showSuccessToast('Payment pending', 'Please complete your payment.');
                router.push(`/profile`);
              },
              onError: function () {
                showErrorToast('Payment failed', 'Please try again.');
              },
              onClose: function () {
                showErrorToast('Payment cancelled', 'You closed the payment popup.');
              },
            });
          } else {
            showErrorToast('Payment gateway unavailable', 'Please try again later.');
          }
        },
        onError: (error) => {
          showErrorToast(error, 'Payment failed');
        },
      }
    );
  };

  if (!bookingId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error" className="text-5xl text-secondary" />
        <p className="text-lg text-ink-muted font-medium">No booking found.</p>
        <button onClick={() => router.push('/concerts')} className="btn-brutal btn-ghost text-sm">
          Browse concerts
        </button>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background py-12">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => router.back()} className="btn-brutal btn-ghost text-sm mb-4">
            <Icon name="arrow_back" className="text-xl" /> Back
          </button>
          <h1 className="text-3xl font-bold font-heading text-ink">Secure Checkout</h1>
          {timeLeft && (
            <p className="text-ink-muted mt-1">
              Complete your purchase within{' '}
              <span className={`font-bold ${timeLeft === 'Expired' ? 'text-secondary' : 'text-secondary'}`}>
                {timeLeft}
              </span>{' '}
              to secure your tickets.
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Payment Action */}
          <div className="flex-1">
            <div className="card-brutal-static p-6 sm:p-8">
              <h2 className="text-xl font-bold font-heading text-ink mb-6 flex items-center gap-2">
                <Icon name="account_balance_wallet" /> Complete Payment
              </h2>

              <div className="text-center py-8 text-ink-muted">
                <Icon name="payment" className="text-5xl mb-4 text-primary" />
                <p className="font-medium mb-4">Click Pay to open the Midtrans secure payment gateway.</p>
                <div className="pt-6 border-t-2 border-border-brutal">
                  <button
                    onClick={submitPayment}
                    disabled={processPayment.isPending || timeLeft === 'Expired'}
                    className="btn-brutal btn-primary w-full py-4 text-base"
                  >
                    {processPayment.isPending ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Icon name="lock" className="mr-2" />
                        Pay Rp {booking?.totalAmount?.toLocaleString('id-ID') || '0'}
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-ink-muted mt-4 flex items-center justify-center gap-1">
                    <Icon name="verified_user" className="text-sm text-accent" /> Payments are secure and encrypted.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96">
            <div className="card-brutal-static p-6 sticky top-24">
              <h3 className="text-lg font-bold font-heading text-ink mb-6">Order Summary</h3>

              {booking?.concert && (
                <div className="flex gap-4 mb-6 pb-6 border-b-2 border-border-brutal/30">
                  <img
                    src={booking.concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'}
                    alt={booking.concert.title}
                    className="w-20 h-20 rounded-xl border-2 border-border-brutal object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-ink">{booking.concert.title}</h4>
                    <p className="text-sm text-ink-muted mt-1 flex items-center gap-1">
                      <Icon name="calendar_today" className="text-sm" />
                      {new Date(booking.concert.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-ink-muted flex items-center gap-1">
                      <Icon name="location_on" className="text-sm" />
                      {booking.concert.venue}, {booking.concert.city}
                    </p>
                  </div>
                </div>
              )}

              {booking?.items && (
                <div className="space-y-3 mb-6 pb-6 border-b-2 border-border-brutal/30">
                  {booking.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-ink-muted text-sm">
                      <span>
                        {item.quantity}x {item.ticketType?.name || 'Ticket'}
                      </span>
                      <span className="font-bold text-ink">Rp {item.subtotal?.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-ink-muted">Total Due</p>
                  <p className="text-3xl font-bold font-heading text-ink">
                    Rp {booking?.totalAmount?.toLocaleString('id-ID') || '0'}
                  </p>
                </div>
                <span className="badge-brutal bg-primary/10 text-primary text-xs">IDR</span>
              </div>

              <div className="bg-accent-yellow/20 text-ink text-xs p-4 rounded-xl border-2 border-accent-yellow/50 flex items-start gap-2">
                <Icon name="info" className="text-base shrink-0" />
                <p>
                  Tickets are non-refundable. By clicking &apos;Pay&apos;, you agree to our Terms of Service &amp; Privacy
                  Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
