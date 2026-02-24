'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useConcerts } from '@/hooks/queries/useConcerts';

export default function Home() {
  const { data } = useConcerts({ limit: 3 });
  const concerts = data?.data ?? [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMinPrice = (concert: (typeof concerts)[0]) => {
    if (!concert.ticketTypes?.length) return 0;
    return Math.min(...concert.ticketTypes.map((t) => t.price));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/90 via-background-dark/95 to-background-dark z-10" />
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80"
            alt="Concert background"
            className="w-full h-full object-cover opacity-50"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Experience Live Music <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Like Never Before
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Secure your spot at the most anticipated concerts worldwide. Fast, secure, and hassle-free ticketing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/concerts"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-[var(--color-primary-hover)] rounded-xl shadow-lg transition-all gap-2"
            >
              Browse Concerts
              <Icon name="arrow_forward" className="text-xl" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Popular Upcoming</h2>
              <p className="text-slate-500 dark:text-slate-400">Don&apos;t miss out on these trending events</p>
            </div>
            <Link href="/concerts" className="hidden sm:flex items-center gap-2 text-primary hover:text-[var(--color-primary-hover)] font-medium transition-colors">
              View All <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {concerts.map((concert) => (
              <Link key={concert.id} href={`/concerts/${concert.id}`} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block">
                <div className="relative h-48 sm:h-64 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                   <img src={concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'} alt={concert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute bottom-4 left-4 z-20">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm mb-2">
                          {concert.city}
                       </span>
                       <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{concert.title}</h3>
                   </div>
                </div>
                <div className="p-5">
                   <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                          <Icon name="calendar_today" className="text-[18px]" />
                          <span>{formatDate(concert.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                          <Icon name="location_on" className="text-[18px]" />
                          <span>{concert.venue}, {concert.city}</span>
                      </div>
                   </div>
                   <div className="mt-6 flex items-center justify-between">
                       <div>
                           <p className="text-xs text-slate-500 dark:text-slate-400">Starting from</p>
                           <p className="text-lg font-bold text-slate-900 dark:text-white">Rp {getMinPrice(concert).toLocaleString('id-ID')}</p>
                       </div>
                       <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <Icon name="arrow_forward" />
                       </span>
                   </div>
                </div>
              </Link>
            ))}

            {concerts.length === 0 && (
              <div className="col-span-3 text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No concerts available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

       {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Book With Us?</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Experience a ticketing platform built for fans, prioritizing fairness, security, and speed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="flex flex-col items-center text-center">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                         <Icon name="security" className="text-3xl text-primary" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure Transactions</h3>
                     <p className="text-slate-500 dark:text-slate-400">Your payments and data are protected with industry-leading encryption.</p>
                 </div>
                  <div className="flex flex-col items-center text-center">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                         <Icon name="hourglass_empty" className="text-3xl text-primary" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Fair Queue System</h3>
                     <p className="text-slate-500 dark:text-slate-400">Our smart anti-bot queue ensures real fans get the tickets they deserve.</p>
                 </div>
                 <div className="flex flex-col items-center text-center">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                         <Icon name="bolt" className="text-3xl text-primary" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Instant Delivery</h3>
                     <p className="text-slate-500 dark:text-slate-400">Get your digital tickets instantly in your wallet upon successful payment.</p>
                 </div>
            </div>
        </div>
      </section>

    </div>
  );
}
