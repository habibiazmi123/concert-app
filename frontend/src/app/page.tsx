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
      <section className="relative py-20 lg:py-32 overflow-hidden bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 badge-brutal bg-accent-yellow mb-6">
                <Icon name="auto_awesome" className="text-sm" />
                <span>Your #1 Ticket Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-ink tracking-tight mb-6">
                Experience Live Music{' '}
                <span className="text-primary">Like Never Before</span>
              </h1>
              <p className="text-lg text-ink-muted max-w-xl mb-10">
                Secure your spot at the most anticipated concerts worldwide. Fast, secure, and hassle-free ticketing.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link href="/concerts" className="btn-brutal btn-primary text-base py-3 px-8">
                  Browse Concerts
                  <Icon name="arrow_forward" className="text-xl" />
                </Link>
                <Link href="/register" className="btn-brutal btn-accent text-base py-3 px-8">
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden lg:block">
              <div className="card-brutal-static p-4 rotate-2">
                <img
                  src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800"
                  alt="Concert"
                  className="w-full h-72 object-cover rounded-lg border-2 border-border-brutal"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold font-heading text-ink mb-2">Popular Upcoming</h2>
              <p className="text-ink-muted">Don&apos;t miss out on these trending events</p>
            </div>
            <Link href="/concerts" className="btn-brutal btn-ghost text-sm hidden sm:flex">
              View All <Icon name="arrow_forward" className="text-lg" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {concerts.map((concert) => (
              <Link key={concert.id} href={`/concerts/${concert.id}`} className="card-brutal group block overflow-hidden">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge-brutal bg-accent-yellow text-xs">
                      {concert.city}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold font-heading text-ink mb-3 group-hover:text-primary transition-colors">
                    {concert.title}
                  </h3>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-ink-muted text-sm">
                      <Icon name="calendar_today" className="text-base" />
                      <span>{formatDate(concert.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-muted text-sm">
                      <Icon name="location_on" className="text-base" />
                      <span>{concert.venue}, {concert.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-border-brutal/30">
                    <div>
                      <p className="text-xs text-ink-muted">Starting from</p>
                      <p className="text-lg font-bold font-heading text-ink">Rp {getMinPrice(concert).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center text-white group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-brutal transition-all">
                      <Icon name="arrow_forward" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {concerts.length === 0 && (
              <div className="col-span-3 card-brutal-static p-12 text-center text-ink-muted">
                <Icon name="event" className="text-4xl mb-2" />
                <p className="font-medium">No concerts available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface border-t-2 border-border-brutal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-ink mb-4">Why Book With Us?</h2>
            <p className="text-ink-muted max-w-2xl mx-auto">Experience a ticketing platform built for fans, prioritizing fairness, security, and speed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'security', title: 'Secure Transactions', desc: 'Your payments and data are protected with industry-leading encryption.', color: 'bg-primary' },
              { icon: 'hourglass_empty', title: 'Fair Queue System', desc: 'Our smart anti-bot queue ensures real fans get the tickets they deserve.', color: 'bg-secondary' },
              { icon: 'bolt', title: 'Instant Delivery', desc: 'Get your digital tickets instantly in your wallet upon successful payment.', color: 'bg-accent' },
            ].map((f) => (
              <div key={f.title} className="card-brutal-static p-6 text-center">
                <div className={`w-14 h-14 rounded-xl ${f.color} border-2 border-border-brutal mx-auto mb-5 flex items-center justify-center`}>
                  <Icon name={f.icon} className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-bold font-heading text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
