'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@/components/ui/Icon';
import { useBooking } from '@/hooks/queries/useBookings';
import { useProcessPaymentMutation } from '@/hooks/queries/usePayments';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { paymentSchema, type PaymentFormData } from '@/lib/schemas';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId);
  const processPayment = useProcessPaymentMutation();

  const [paymentMethod, setPaymentMethod] = useState('card');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

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
      {
        bookingId,
        method: paymentMethod === 'card' ? 'CREDIT_CARD' : 'E_WALLET',
      },
      {
        onSuccess: () => {
          showSuccessToast('Payment successful!', 'Your tickets are confirmed');
          router.push(`/success?bookingId=${bookingId}`);
        },
        onError: (error) => {
          showErrorToast(error, 'Payment failed');
        },
      }
    );
  };

  const onFormSubmit = (_data: PaymentFormData) => {
    submitPayment();
  };

  const handleEwalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPayment();
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
          {/* Payment Details */}
          <div className="flex-1">
            <div className="card-brutal-static p-6 sm:p-8">
              <h2 className="text-xl font-bold font-heading text-ink mb-6 flex items-center gap-2">
                <Icon name="credit_card" /> Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5 text-primary shadow-brutal-sm'
                      : 'border-border-brutal text-ink-muted hover:bg-surface-alt'
                  }`}
                >
                  <Icon name="credit_score" className="text-3xl mb-2" />
                  <span className="font-bold">Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ewallet')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'ewallet'
                      ? 'border-primary bg-primary/5 text-primary shadow-brutal-sm'
                      : 'border-border-brutal text-ink-muted hover:bg-surface-alt'
                  }`}
                >
                  <Icon name="account_balance_wallet" className="text-3xl mb-2" />
                  <span className="font-bold">E-Wallet</span>
                </button>
              </div>

              <form
                onSubmit={paymentMethod === 'card' ? handleSubmit(onFormSubmit) : handleEwalletSubmit}
                className="space-y-6"
              >
                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-ink mb-1">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="name"
                        placeholder="John Doe"
                        {...register('name')}
                        className={`input-brutal ${errors.name ? 'input-brutal-error' : ''}`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-secondary font-medium">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-semibold text-ink mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <Icon name="credit_card" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                        <input
                          type="text"
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          {...register('cardNumber')}
                          className={`input-brutal pl-12 tracking-widest ${errors.cardNumber ? 'input-brutal-error' : ''}`}
                        />
                      </div>
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-secondary font-medium">{errors.cardNumber.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-semibold text-ink mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          placeholder="MM/YY"
                          {...register('expiry')}
                          className={`input-brutal ${errors.expiry ? 'input-brutal-error' : ''}`}
                        />
                        {errors.expiry && <p className="mt-1 text-sm text-secondary font-medium">{errors.expiry.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="cvc" className="block text-sm font-semibold text-ink mb-1">
                          CVC
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="cvc"
                            placeholder="123"
                            {...register('cvc')}
                            className={`input-brutal ${errors.cvc ? 'input-brutal-error' : ''}`}
                          />
                          <Icon name="help" className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light text-sm cursor-help" />
                        </div>
                        {errors.cvc && <p className="mt-1 text-sm text-secondary font-medium">{errors.cvc.message}</p>}
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'ewallet' && (
                  <div className="text-center py-8 text-ink-muted">
                    <Icon name="account_balance_wallet" className="text-5xl mb-4 text-primary" />
                    <p className="font-medium">Click Pay to proceed with E-Wallet payment.</p>
                  </div>
                )}

                <div className="pt-6 border-t-2 border-border-brutal">
                  <button
                    type="submit"
                    disabled={processPayment.isPending || timeLeft === 'Expired'}
                    className="btn-brutal btn-primary w-full py-4 text-base"
                  >
                    {processPayment.isPending ? (
                      <>
                        <Icon name="progress_activity" className="animate-spin mr-2" />
                        Processing Payment...
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
              </form>
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
                  {booking.items.map((item) => (
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
