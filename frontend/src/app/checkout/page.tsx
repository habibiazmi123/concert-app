'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, type PaymentFormData } from '@/lib/schemas';
import { Icon } from '@/components/ui/Icon';
import { useBooking } from '@/hooks/queries/useBookings';
import { useProcessPaymentMutation } from '@/hooks/queries/usePayments';
import { showErrorToast, showSuccessToast } from '@/lib/toast';

const BANKS = [
  { id: 'bca', name: 'BCA', logo: 'BCA' },
  { id: 'bni', name: 'BNI', logo: 'BNI' },
  { id: 'bri', name: 'BRI', logo: 'BRI' },
  { id: 'mandiri', name: 'Mandiri', logo: 'Mandiri' },
  { id: 'permata', name: 'Permata', logo: 'Permata' },
  { id: 'cimb', name: 'CIMB Niaga', logo: 'CIMB' },
];

// Render component removed

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId);
  const processPayment = useProcessPaymentMutation();

  const [isTokenizing, setIsTokenizing] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'credit_card',
      bankCode: 'bca',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const selectedBank = watch('bankCode');

  useEffect(() => {
    if (!booking) return;

    if (booking.status === 'CONFIRMED' || booking.payment?.status === 'COMPLETED') {
      router.push(`/success?bookingId=${bookingId}`);
      return;
    }

    if (booking.payment?.status === 'PENDING' && booking.payment?.method === 'BANK_TRANSFER') {
      router.push(`/instruction?bookingId=${bookingId}`);
      return;
    }

    if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
      showErrorToast('This booking is extremely expired or cancelled.');
      router.push('/concerts');
      return;
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

  const handleBankTransferSubmit = (data: PaymentFormData) => {
    processPayment.mutate(
      { bookingId, paymentType: 'bank_transfer', bank: data.bankCode },
      {
        onSuccess: (res) => {
          if (res.status === 'pending') {
            router.push(`/instruction?bookingId=${bookingId}`);
          } else {
            router.push(`/success?bookingId=${bookingId}`);
          }
        },
        onError: (error) => {
          showErrorToast(error, 'Payment failed');
        },
      }
    );
  };

  const handleCreditCardSubmit = async (data: PaymentFormData) => {
    setIsTokenizing(true);
    try {
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      const apiUrl =
        process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://api.midtrans.com/v2/token'
          : 'https://api.sandbox.midtrans.com/v2/token';

      const queryParams = new URLSearchParams({
        client_key: clientKey || '',
        card_number: data.cardNumber || '',
        card_cvv: data.cvv || '',
        card_exp_month: data.expiryMonth || '',
        card_exp_year: `20${data.expiryYear?.slice(-2)}`, // Ensure YYYY format
      });

      const tokenRes = await fetch(`${apiUrl}?${queryParams.toString()}`);
      const tokenData = await tokenRes.json();

      if (tokenData.status_code !== '200') {
        throw new Error(tokenData.validation_messages?.[0] || 'Card validation failed');
      }

      const tokenId = tokenData.token_id;

      processPayment.mutate(
        { bookingId, paymentType: 'credit_card', tokenId },
        {
          onSuccess: (res) => {
            if (res.redirectUrl) {
              window.location.href = res.redirectUrl;
            } else {
              showSuccessToast('Payment successful!', 'Your tickets are confirmed');
              router.push(`/success?bookingId=${bookingId}`);
            }
          },
          onError: (error) => {
            showErrorToast(error, 'Payment failed');
          },
        }
      );
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to process card', 'Payment Error');
    } finally {
      setIsTokenizing(false);
    }
  };

  const onSubmit = (data: PaymentFormData) => {
    if (data.paymentMethod === 'credit_card') {
      handleCreditCardSubmit(data);
    } else {
      handleBankTransferSubmit(data);
    }
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
          {/* Payment Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="card-brutal-static p-6 sm:p-8">
              <h2 className="text-xl font-bold font-heading text-ink mb-6 flex items-center gap-2">
                <Icon name="payment" /> Payment Method
              </h2>

              <div className="flex gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setValue('paymentMethod', 'credit_card')}
                  className={`flex-1 p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-brutal bg-surface hover:bg-surface-hover text-ink-muted'
                  }`}
                >
                  <Icon name="credit_card" className="text-2xl" />
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setValue('paymentMethod', 'bank_transfer', { shouldValidate: true })}
                  className={`flex-1 p-4 rounded-xl border-2 font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-brutal bg-surface hover:bg-surface-hover text-ink-muted'
                  }`}
                >
                  <Icon name="account_balance" className="text-2xl" />
                  Bank Transfer
                </button>
              </div>

              {paymentMethod === 'credit_card' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-ink mb-2">Name on Card</label>
                    <input
                      {...register('name')}
                      className={`input-brutal w-full ${errors.name ? 'border-secondary focus:ring-secondary/20' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-sm text-secondary font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-ink mb-2">Card Number</label>
                    <div className="relative">
                      <Icon name="credit_card" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input
                        {...register('cardNumber')}
                        className={`input-brutal w-full pl-10 ${
                          errors.cardNumber ? 'border-secondary focus:ring-secondary/20' : ''
                        }`}
                        placeholder="0000 0000 0000 0000"
                        maxLength={16}
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-secondary font-medium">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-ink mb-2">Expiry</label>
                      <div className="flex gap-2">
                        <input
                          {...register('expiryMonth')}
                          className={`input-brutal w-full text-center ${
                            errors.expiryMonth ? 'border-secondary focus:ring-secondary/20' : ''
                          }`}
                          placeholder="MM"
                          maxLength={2}
                        />
                        <span className="text-2xl text-ink-muted font-light">/</span>
                        <input
                          {...register('expiryYear')}
                          className={`input-brutal w-full text-center ${
                            errors.expiryYear ? 'border-secondary focus:ring-secondary/20' : ''
                          }`}
                          placeholder="YY"
                          maxLength={4}
                        />
                      </div>
                      {(errors.expiryMonth || errors.expiryYear) && (
                        <p className="mt-1 text-sm text-secondary font-medium">Valid expiry required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ink mb-2 flex items-center gap-1">
                        CVV
                        <Icon name="info" className="text-sm text-ink-muted" />
                      </label>
                      <input
                        {...register('cvv')}
                        type="password"
                        className={`input-brutal w-full ${
                          errors.cvv ? 'border-secondary focus:ring-secondary/20' : ''
                        }`}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvv && <p className="mt-1 text-sm text-secondary font-medium">{errors.cvv.message}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-bold text-ink mb-4">Select Bank</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BANKS.map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setValue('bankCode', bank.id, { shouldValidate: true })}
                        className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                          selectedBank === bank.id
                            ? 'border-primary bg-primary/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'border-border-brutal bg-surface hover:bg-surface-hover hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <span className="font-heading font-bold text-lg">{bank.logo}</span>
                        <span className="text-xs font-medium text-ink-muted">{bank.name}</span>
                      </div>
                    ))}
                  </div>
                  {errors.bankCode && (
                    <p className="mt-2 text-sm text-secondary font-medium">{errors.bankCode.message}</p>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t-2 border-border-brutal">
                <button
                  type="submit"
                  disabled={processPayment.isPending || isTokenizing || timeLeft === 'Expired'}
                  className="btn-brutal btn-primary w-full py-4 text-base"
                >
                  {processPayment.isPending || isTokenizing ? (
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
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96">
            <div className="card-brutal-static p-6 sticky top-24">
              <h3 className="text-lg font-bold font-heading text-ink mb-6">Order Summary</h3>

              {booking?.concert && (
                <div className="flex gap-4 mb-6 pb-6 border-b-2 border-border-brutal/30">
                  <img
                    src={
                      booking.concert.imageUrl ||
                      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'
                    }
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
                  Tickets are non-refundable. By clicking 'Pay', you agree to our Terms of Service & Privacy Policy.
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
