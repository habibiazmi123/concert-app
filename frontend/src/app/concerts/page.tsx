'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export default function ConcertsListPage() {
  const dummyConcerts = [
    { id: 1, title: 'Neon Nights Festival', genre: 'Electronic', date: 'Oct 15, 2026', venue: 'O2 Arena, London', price: 85, image: 'https://images.unsplash.com/photo-1540039155732-68c8c08e3596?auto=format&fit=crop&q=80' },
    { id: 2, title: 'The Midnight Symphony', genre: 'Rock', date: 'Nov 02, 2026', venue: 'Madison Square Garden, NY', price: 120, image: 'https://images.unsplash.com/photo-1470229722913-7c092db62220?auto=format&fit=crop&q=80' },
    { id: 3, title: 'Summer Vibes World Tour', genre: 'Pop', date: 'Aug 24, 2026', venue: 'Stade de France, Paris', price: 95, image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80' },
    { id: 4, title: 'Jazz in the Park', genre: 'Jazz', date: 'Jul 10, 2026', venue: 'Central Park, NY', price: 45, image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80' },
    { id: 5, title: 'Urban Beats Showcase', genre: 'Hip Hop', date: 'Sep 05, 2026', venue: 'Staples Center, LA', price: 110, image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f22f74?auto=format&fit=crop&q=80' },
    { id: 6, title: 'Classical Masters Live', genre: 'Classical', date: 'Dec 12, 2026', venue: 'Sydney Opera House', price: 150, image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Discover Concerts</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">Browse our curated selection of upcoming events, festivals, and exclusive shows happening around the globe.</p>
         </div>

         {/* Filters & Search - Mock UI */}
         <div className="flex flex-col sm:flex-row gap-4 mb-10">
             <div className="relative flex-1">
                 <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search by artist, event, or venue..." 
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm text-slate-900 dark:text-white"
                 />
             </div>
             <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                 <Icon name="tune" /> Filters
             </button>
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyConcerts.map((concert) => (
               <Link key={concert.id} href={`/concerts/${concert.id}`} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block">
                  <div className="relative h-48 sm:h-64 overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                     <img src={concert.image} alt={concert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute bottom-4 left-4 z-20">
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary-200 border border-primary/30 backdrop-blur-sm mb-2 text-primary">
                            {concert.genre}
                         </span>
                         <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{concert.title}</h3>
                     </div>
                  </div>
                  <div className="p-5">
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Icon name="calendar_today" className="text-[18px]" />
                            <span>{concert.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            <Icon name="location_on" className="text-[18px]" />
                            <span>{concert.venue}</span>
                        </div>
                     </div>
                     <div className="mt-6 flex items-center justify-between">
                         <div>
                             <p className="text-xs text-slate-500 dark:text-slate-400">Starting from</p>
                             <p className="text-lg font-bold text-slate-900 dark:text-white">${concert.price.toFixed(2)}</p>
                         </div>
                         <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <Icon name="arrow_forward" />
                         </span>
                     </div>
                  </div>
                </Link>
            ))}
         </div>
      </div>
    </div>
  );
}
