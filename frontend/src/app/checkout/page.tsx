'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useBooking } from '@/hooks/queries/useBookings';
import { useProcessPaymentMutation } from '@/hooks/queries/usePayments';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || '';
  const { data: booking, isLoading: bookingLoading } = useBooking(bookingId);
  const processPayment = useProcessPaymentMutation();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
      name: '',
      cardNumber: '',
      expiry: '',
      cvc: ''
  });

  // Countdown timer for booking expiration
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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    processPayment.mutate(
      {
        bookingId,
        method: paymentMethod === 'card' ? 'CREDIT_CARD' : 'E_WALLET',
      },
      {
        onSuccess: () => {
          router.push(`/success?bookingId=${bookingId}`);
        },
        onError: (error: unknown) => {
          alert((error as { message?: string }).message || 'Payment failed');
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
          ...prev,
          [e.target.name]: e.target.value
      }))
  }

  if (!bookingId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error" className="text-5xl text-red-500" />
        <p className="text-lg text-slate-600 dark:text-slate-400">No booking found.</p>
        <button onClick={() => router.push('/concerts')} className="text-primary hover:underline">
          Browse concerts
        </button>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-primary hover:text-[var(--color-primary-hover)] font-medium transition-colors">
                <Icon name="arrow_back" className="text-xl" /> Back 
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4">Secure Checkout</h1>
            {timeLeft && (
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Complete your purchase within <span className={`font-semibold ${timeLeft === 'Expired' ? 'text-red-500' : 'text-red-500'}`}>{timeLeft}</span> to secure your tickets.
              </p>
            )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
            {/* Payment Details */}
            <div className="flex-1">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                   <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                       <Icon name="credit_card" /> Payment Method
                   </h2>

                   <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                        >
                            <Icon name="credit_score" className="text-3xl mb-2" />
                            <span className="font-medium">Credit Card</span>
                        </button>
                         <button 
                            type="button"
                            onClick={() => setPaymentMethod('ewallet')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'ewallet' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                        >
                            <Icon name="account_balance_wallet" className="text-3xl mb-2" />
                            <span className="font-medium">E-Wallet</span>
                        </button>
                   </div>

                   <form onSubmit={handleCheckout} className="space-y-6">
                        {paymentMethod === 'card' && (
                          <>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name on Card</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    name="name" 
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe" 
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                                <div className="relative">
                                    <Icon name="credit_card" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        id="cardNumber" 
                                        name="cardNumber" 
                                        required
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        placeholder="0000 0000 0000 0000" 
                                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all tracking-widest font-mono"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        id="expiry" 
                                        name="expiry" 
                                        required
                                        value={formData.expiry}
                                        onChange={handleChange}
                                        placeholder="MM/YY" 
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CVC</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            id="cvc" 
                                            name="cvc" 
                                            required
                                            value={formData.cvc}
                                            onChange={handleChange}
                                            placeholder="123" 
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"
                                        />
                                        <Icon name="help" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm cursor-help" />
                                    </div>
                                </div>
                            </div>
                          </>
                        )}

                        {paymentMethod === 'ewallet' && (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <Icon name="account_balance_wallet" className="text-5xl mb-4 text-primary" />
                            <p>Click Pay to proceed with E-Wallet payment.</p>
                          </div>
                        )}

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                             <button
                                type="submit"
                                disabled={processPayment.isPending || timeLeft === 'Expired'}
                                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-primary hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-wait"
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
                            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                                <Icon name="verified_user" className="text-sm text-green-500" /> Payments are secure and encrypted.
                            </p>
                        </div>
                   </form>
                </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="w-full lg:w-96">
                <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 sticky top-24">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Order Summary</h3>
                    
                    {booking?.concert && (
                      <div className="flex gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                          <img 
                              src={booking.concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'} 
                              alt={booking.concert.title} 
                              className="w-20 h-20 rounded-lg object-cover shadow-sm"
                          />
                          <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{booking.concert.title}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <Icon name="calendar_today" className="text-[14px]"/>
                                {new Date(booking.concert.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Icon name="location_on" className="text-[14px]"/>
                                {booking.concert.venue}, {booking.concert.city}
                              </p>
                          </div>
                      </div>
                    )}

                    {booking?.items && (
                      <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                        {booking.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                              <span>{item.quantity}x {item.ticketType?.name || 'Ticket'}</span>
                              <span className="font-medium">Rp {item.subtotal?.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-sm text-slate-500">Total Due</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">
                              Rp {booking?.totalAmount?.toLocaleString('id-ID') || '0'}
                            </p>
                        </div>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">IDR</span>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs p-4 rounded-lg flex items-start gap-2 border border-yellow-200 dark:border-yellow-900/50">
                        <Icon name="info" className="text-base shrink-0" />
                        <p>Tickets are non-refundable. By clicking &apos;Pay&apos;, you agree to our Terms of Service & Privacy Policy.</p>
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
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
