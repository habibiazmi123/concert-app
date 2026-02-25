'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { useConcerts } from '@/hooks/queries/useConcerts';
import type { ConcertQuery } from '@/lib/types';

export default function ConcertsListPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState<ConcertQuery>({ page: 1, limit: 9 });
  const { data, isLoading, isError } = useConcerts(query);

  const concerts = data?.data ?? [];
  const meta = data?.meta;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  };

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
    <div className="flex-1 bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-bold font-heading text-ink mb-4 tracking-tight">Discover Concerts</h1>
          <p className="text-lg text-ink-muted max-w-2xl">Browse our curated selection of upcoming events, festivals, and exclusive shows happening around the globe.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
            <input 
              type="text" 
              placeholder="Search by artist, event, or venue..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-brutal pl-12 w-full"
            />
          </div>
          <button type="submit" className="btn-brutal btn-primary py-3">
            <Icon name="search" /> Search
          </button>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="card-brutal-static p-12 text-center">
            <Icon name="error" className="text-5xl text-secondary mb-4" />
            <p className="text-lg text-ink-muted font-medium">Failed to load concerts. Please try again later.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && concerts.length === 0 && (
          <div className="card-brutal-static p-12 text-center">
            <Icon name="music_off" className="text-5xl text-ink-light mb-4" />
            <p className="text-lg text-ink-muted font-medium">No concerts found. Try a different search.</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && concerts.length > 0 && (
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
                    <div className="flex items-center gap-2 text-ink-muted text-sm">
                      <Icon name="person" className="text-base" />
                      <span>{concert.artist}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-border-brutal/30">
                    <div>
                      <p className="text-xs text-ink-muted">Starting from</p>
                      <p className="text-lg font-bold font-heading text-ink">
                        Rp {getMinPrice(concert).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center text-white group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-brutal transition-all">
                      <Icon name="arrow_forward" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              disabled={meta.page <= 1}
              onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
              className="btn-brutal btn-ghost"
            >
              <Icon name="chevron_left" /> Previous
            </button>
            <span className="text-sm text-ink-muted font-medium">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
              className="btn-brutal btn-ghost"
            >
              Next <Icon name="chevron_right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
