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
    <div className="flex-1 bg-background-light dark:bg-background-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Discover Concerts</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">Browse our curated selection of upcoming events, festivals, and exclusive shows happening around the globe.</p>
         </div>

         {/* Search */}
         <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10">
             <div className="relative flex-1">
                 <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search by artist, event, or venue..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm text-slate-900 dark:text-white"
                 />
             </div>
             <button 
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
             >
                 <Icon name="search" /> Search
             </button>
         </form>

         {/* Loading State */}
         {isLoading && (
           <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           </div>
         )}

         {/* Error State */}
         {isError && (
           <div className="text-center py-20">
             <Icon name="error" className="text-5xl text-red-500 mb-4" />
             <p className="text-lg text-slate-600 dark:text-slate-400">Failed to load concerts. Please try again later.</p>
           </div>
         )}

         {/* Empty State */}
         {!isLoading && !isError && concerts.length === 0 && (
           <div className="text-center py-20">
             <Icon name="music_off" className="text-5xl text-slate-400 mb-4" />
             <p className="text-lg text-slate-600 dark:text-slate-400">No concerts found. Try a different search.</p>
           </div>
         )}

         {/* Grid */}
         {!isLoading && concerts.length > 0 && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {concerts.map((concert) => (
                 <Link key={concert.id} href={`/concerts/${concert.id}`} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block">
                    <div className="relative h-48 sm:h-64 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                       <img 
                         src={concert.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80'} 
                         alt={concert.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       />
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
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                              <Icon name="person" className="text-[18px]" />
                              <span>{concert.artist}</span>
                          </div>
                       </div>
                       <div className="mt-6 flex items-center justify-between">
                           <div>
                               <p className="text-xs text-slate-500 dark:text-slate-400">Starting from</p>
                               <p className="text-lg font-bold text-slate-900 dark:text-white">
                                 Rp {getMinPrice(concert).toLocaleString('id-ID')}
                               </p>
                           </div>
                           <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                              <Icon name="arrow_forward" />
                           </span>
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
               className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Icon name="chevron_left" /> Previous
             </button>
             <span className="text-sm text-slate-500 dark:text-slate-400">
               Page {meta.page} of {meta.totalPages}
             </span>
             <button
               disabled={meta.page >= meta.totalPages}
               onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
               className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Next <Icon name="chevron_right" />
             </button>
           </div>
         )}
      </div>
    </div>
  );
}
