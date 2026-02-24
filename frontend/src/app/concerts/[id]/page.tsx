'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/auth';
import { useConcert } from '@/hooks/queries/useConcerts';
import { useCreateBookingMutation } from '@/hooks/queries/useBookings';
import type { TicketType } from '@/lib/types';

export default function ConcertDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const concertId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { data: concert, isLoading, isError } = useConcert(concertId);
  const createBooking = useCreateBookingMutation();

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  const handleQuantityChange = (ticketTypeId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketTypeId] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      if (next === 0) {
        const { [ticketTypeId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketTypeId]: next };
    });
  };

  const totalAmount = concert?.ticketTypes.reduce((sum, tt) => {
    return sum + (selectedTickets[tt.id] || 0) * tt.price;
  }, 0) ?? 0;

  const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

  const handleJoinQueue = () => {
    if (!isAuthenticated) {
      alert('Please log in to book tickets.');
      router.push('/login');
      return;
    }

    if (totalTickets === 0) {
      alert('Please select at least one ticket.');
      return;
    }

    const items = Object.entries(selectedTickets)
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    createBooking.mutate(
      { concertId, items },
      {
        onSuccess: (data) => {
          router.push(`/waitroom?jobId=${data.queueJobId}`);
        },
        onError: (error: unknown) => {
          alert((error as { message?: string }).message || 'Failed to create booking');
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !concert) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error" className="text-5xl text-red-500" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Concert not found</p>
        <button onClick={() => router.push('/concerts')} className="text-primary hover:underline">
          Back to concerts
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Hero Header */}
      <div className="relative h-96 lg:h-[500px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/50 to-transparent dark:from-background-dark dark:via-background-dark/50 z-10" />
          <img
            src={concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'}
            alt={concert.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
            <div className="flex items-center gap-3 mb-4">
               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm">
                  {concert.city}
               </span>
               {concert.ticketTypes.some((tt) => tt.availableSeats < tt.totalSeats * 0.2) && (
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30 backdrop-blur-sm">
                   Selling Fast
                 </span>
               )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              {concert.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-lg text-slate-700 dark:text-slate-300">
               <span className="flex items-center gap-2"><Icon name="calendar_today" className="text-primary"/> {formatDate(concert.date)}</span>
               <span className="flex items-center gap-2"><Icon name="schedule" className="text-primary"/> {formatTime(concert.date)}</span>
               <span className="flex items-center gap-2"><Icon name="location_on" className="text-primary"/> {concert.venue}, {concert.city}</span>
               <span className="flex items-center gap-2"><Icon name="person" className="text-primary"/> {concert.artist}</span>
            </div>
        </div>
      </div>

       {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                 {/* About section */}
                  <section>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About The Event</h2>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
                          <p>{concert.description}</p>
                      </div>
                  </section>

                  {/* Venue Info */}
                  <section>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Venue</h2>
                      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon name="location_on" className="text-2xl text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{concert.venue}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{concert.address}, {concert.city}</p>
                          </div>
                        </div>
                      </div>
                  </section>
              </div>

               {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                 <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 lg:sticky lg:top-24 shadow-lg shadow-black/5">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select Tickets</h3>
                     
                     {/* Ticket Types */}
                     <div className="space-y-4 mb-6">
                        {concert.ticketTypes.map((tt: TicketType) => (
                          <div key={tt.id} className="flex justify-between items-center p-4 border border-slate-200 dark:border-border-dark rounded-xl">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white">{tt.name}</p>
                              {tt.description && <p className="text-sm text-slate-500 dark:text-slate-400">{tt.description}</p>}
                              <p className="text-sm text-slate-400 mt-1">{tt.availableSeats} seats left</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">Rp {tt.price.toLocaleString('id-ID')}</p>
                              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-background-light dark:bg-background-dark">
                                <button
                                  onClick={() => handleQuantityChange(tt.id, -1)}
                                  disabled={!selectedTickets[tt.id]}
                                  className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                >
                                  <Icon name="remove" className="text-sm" />
                                </button>
                                <span className="px-3 py-1 font-medium text-slate-900 dark:text-white text-sm w-8 text-center border-x border-slate-300 dark:border-slate-700">
                                  {selectedTickets[tt.id] || 0}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(tt.id, 1)}
                                  disabled={tt.availableSeats === 0 || (selectedTickets[tt.id] || 0) >= 10}
                                  className="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                                >
                                  <Icon name="add" className="text-sm" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                     </div>

                     {/* Total */}
                     {totalTickets > 0 && (
                       <div className="flex justify-between items-center mb-6 border-t border-slate-200 dark:border-border-dark pt-4">
                         <div>
                           <p className="text-sm text-slate-500 dark:text-slate-400">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                           <p className="text-2xl font-bold text-slate-900 dark:text-white">Rp {totalAmount.toLocaleString('id-ID')}</p>
                         </div>
                       </div>
                     )}

                     <button 
                        onClick={handleJoinQueue}
                        disabled={createBooking.isPending || totalTickets === 0}
                        className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-lg font-bold text-white bg-primary hover:bg-[var(--color-primary-hover)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                     >
                        {createBooking.isPending ? (
                          <><Icon name="progress_activity" className="animate-spin mr-2" /> Joining Queue...</>
                        ) : (
                          'Find Tickets'
                        )}
                     </button>
                     <p className="text-center text-xs text-slate-500 mt-4 flex justify-center items-center gap-1">
                         <Icon name="bolt" className="text-sm text-yellow-500" /> High demand expected
                     </p>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
}
