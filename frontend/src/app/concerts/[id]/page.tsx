'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/auth';
import { useConcert } from '@/hooks/queries/useConcerts';
import { useCreateBookingMutation } from '@/hooks/queries/useBookings';
import { showErrorToast } from '@/lib/toast';
import { toast } from 'sonner';
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
      toast.warning('Please log in to book tickets.');
      router.push('/login');
      return;
    }

    if (totalTickets === 0) {
      toast.warning('Please select at least one ticket.');
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
        onError: (error) => {
          showErrorToast(error, 'Booking failed');
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
        <div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (isError || !concert) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error" className="text-5xl text-secondary" />
        <p className="text-lg text-ink-muted font-medium">Concert not found</p>
        <button onClick={() => router.push('/concerts')} className="btn-brutal btn-ghost text-sm">
          Back to concerts
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      {/* Hero Header */}
      <div className="relative">
        <div className="h-72 lg:h-96 overflow-hidden">
          <img
            src={concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'}
            alt={concert.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="card-brutal-static p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge-brutal bg-accent-yellow">{concert.city}</span>
              {concert.ticketTypes.some((tt) => tt.availableSeats < tt.totalSeats * 0.2) && (
                <span className="badge-brutal bg-secondary/20 text-secondary">
                  Selling Fast
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-ink tracking-tight mb-4">
              {concert.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-ink-muted">
              <span className="flex items-center gap-2 font-medium"><Icon name="calendar_today" className="text-primary"/> {formatDate(concert.date)}</span>
              <span className="flex items-center gap-2 font-medium"><Icon name="schedule" className="text-primary"/> {formatTime(concert.date)}</span>
              <span className="flex items-center gap-2 font-medium"><Icon name="location_on" className="text-primary"/> {concert.venue}, {concert.city}</span>
              <span className="flex items-center gap-2 font-medium"><Icon name="person" className="text-primary"/> {concert.artist}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About section */}
            <section>
              <h2 className="text-2xl font-bold font-heading text-ink mb-4">About The Event</h2>
              <div className="text-ink-muted leading-relaxed">
                <p>{concert.description}</p>
              </div>
            </section>

            {/* Venue Info */}
            <section>
              <h2 className="text-2xl font-bold font-heading text-ink mb-4">Venue</h2>
              <div className="card-brutal-static p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary border-2 border-border-brutal flex items-center justify-center">
                    <Icon name="location_on" className="text-2xl text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-ink text-lg">{concert.venue}</p>
                    <p className="text-sm text-ink-muted">{concert.address}, {concert.city}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-brutal-static p-6 lg:sticky lg:top-24">
              <h3 className="text-xl font-bold font-heading text-ink mb-6">Select Tickets</h3>
              
              {/* Ticket Types */}
              <div className="space-y-4 mb-6">
                {concert.ticketTypes.map((tt: TicketType) => (
                  <div key={tt.id} className="flex justify-between items-center p-4 border-2 border-border-brutal/30 rounded-xl bg-surface-alt">
                    <div className="flex-1">
                      <p className="font-bold text-ink">{tt.name}</p>
                      {tt.description && <p className="text-sm text-ink-muted">{tt.description}</p>}
                      <p className="text-sm text-ink-light mt-1">{tt.availableSeats} seats left</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-ink">Rp {tt.price.toLocaleString('id-ID')}</p>
                      <div className="flex items-center border-2 border-border-brutal rounded-xl overflow-hidden bg-surface">
                        <button
                          onClick={() => handleQuantityChange(tt.id, -1)}
                          disabled={!selectedTickets[tt.id]}
                          className="px-3 py-1.5 hover:bg-surface-alt transition-colors disabled:opacity-30"
                        >
                          <Icon name="remove" className="text-sm" />
                        </button>
                        <span className="px-3 py-1.5 font-bold text-sm w-8 text-center border-x-2 border-border-brutal">
                          {selectedTickets[tt.id] || 0}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(tt.id, 1)}
                          disabled={tt.availableSeats === 0 || (selectedTickets[tt.id] || 0) >= 10}
                          className="px-3 py-1.5 hover:bg-surface-alt transition-colors disabled:opacity-30"
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
                <div className="flex justify-between items-center mb-6 border-t-2 border-border-brutal pt-4">
                  <div>
                    <p className="text-sm text-ink-muted">{totalTickets} ticket{totalTickets > 1 ? 's' : ''}</p>
                    <p className="text-2xl font-bold font-heading text-ink">Rp {totalAmount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleJoinQueue}
                disabled={createBooking.isPending || totalTickets === 0}
                className="btn-brutal btn-primary w-full py-4 text-base"
              >
                {createBooking.isPending ? (
                  <><Icon name="progress_activity" className="animate-spin mr-2" /> Joining Queue...</>
                ) : (
                  'Find Tickets'
                )}
              </button>
              <p className="text-center text-xs text-ink-muted mt-4 flex justify-center items-center gap-1">
                <Icon name="bolt" className="text-sm text-accent-yellow" /> High demand expected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
