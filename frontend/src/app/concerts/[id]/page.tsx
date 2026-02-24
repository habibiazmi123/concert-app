'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/auth';


export default function ConcertDetailsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketTier, setTicketTier] = useState('general');

  const handleJoinQueue = () => {
    if (!isAuthenticated) {
        alert('Please log in to book tickets.');
        router.push('/login');
        return;
    }
    
    // Proceed to waitroom if authenticated
    alert('Joining the queue...');
    setTimeout(() => {
        router.push('/waitroom');
    }, 500);
  };

  return (
    <div className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Hero Header */}
      <div className="relative h-96 lg:h-[500px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background-light via-background-light/50 to-transparent dark:from-background-dark dark:via-background-dark/50 z-10" />
          <img
            src="https://images.unsplash.com/photo-1540039155732-68c8c08e3596?auto=format&fit=crop&q=80"
            alt="Neon Nights Festival"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
            <div className="flex items-center gap-3 mb-4">
               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary-200 border border-primary/30 backdrop-blur-sm text-primary">
                  Electronic
               </span>
               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-500 border border-red-500/30 backdrop-blur-sm">
                  Selling Fast
               </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Neon Nights Festival 2026
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-lg text-slate-700 dark:text-slate-300">
               <span className="flex items-center gap-2"><Icon name="calendar_today" className="text-primary"/> Oct 15, 2026</span>
               <span className="flex items-center gap-2"><Icon name="schedule" className="text-primary"/> 8:00 PM (Doors: 6:30 PM)</span>
               <span className="flex items-center gap-2"><Icon name="location_on" className="text-primary"/> O2 Arena, London</span>
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
                          <p>
                              Get ready for the most electrifying experience of the year. The Neon Nights Festival brings 
                              together the world&apos;s top electronic artists for a 4-hour spectacular of light, sound, and energy.
                          </p>
                          <p>
                              Featuring a state-of-the-art visual production and a massive sound system, 
                              this is an event you won&apos;t want to miss. Early arrival is highly recommended.
                          </p>
                      </div>
                  </section>

                  {/* Lineup section */}
                  <section>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Lineup</h2>
                      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
                           <ul className="space-y-4">
                                <li className="flex items-center justify-between border-b border-slate-200 dark:border-border-dark pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">DJ Astro (Headliner)</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">10:00 PM - 12:00 AM</p>
                                        </div>
                                    </div>
                                    <span className="text-primary"><Icon name="headphones" /></span>
                                </li>
                                <li className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-lg">The Synths</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">8:00 PM - 9:30 PM</p>
                                        </div>
                                    </div>
                                    <span className="text-primary"><Icon name="headphones" /></span>
                                </li>
                           </ul>
                      </div>
                  </section>
              </div>

               {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                 <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 lg:sticky lg:top-24 shadow-lg shadow-black/5">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select Tickets</h3>
                     
                     {/* Ticket Tiers */}
                     <div className="space-y-4 mb-6">
                          <label className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all ${ticketTier === 'general' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-border-dark hover:border-slate-400'}`}>
                              <div className="flex items-center gap-3">
                                  <input 
                                     type="radio" 
                                     name="ticketTier" 
                                     value="general" 
                                     checked={ticketTier === 'general'} 
                                     onChange={(e) => setTicketTier(e.target.value)}
                                     className="text-primary focus:ring-primary w-5 h-5 bg-background-light dark:bg-background-dark border-slate-300 dark:border-slate-600"
                                  />
                                  <div>
                                     <p className="font-semibold text-slate-900 dark:text-white">General Admission</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">Standing area</p>
                                  </div>
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white">$85.00</p>
                          </label>

                          <label className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all ${ticketTier === 'vip' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-border-dark hover:border-slate-400'}`}>
                              <div className="flex items-center gap-3">
                                  <input 
                                     type="radio" 
                                     name="ticketTier" 
                                     value="vip" 
                                     checked={ticketTier === 'vip'} 
                                     onChange={(e) => setTicketTier(e.target.value)}
                                      className="text-primary focus:ring-primary w-5 h-5 bg-background-light dark:bg-background-dark border-slate-300 dark:border-slate-600"
                                  />
                                  <div>
                                     <p className="font-semibold text-slate-900 dark:text-white">VIP Access</p>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">Early entry + Lounge</p>
                                  </div>
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white">$150.00</p>
                          </label>
                     </div>

                     {/* Quantity Selector */}
                     <div className="flex justify-between items-center mb-8 border-t border-slate-200 dark:border-border-dark pt-6">
                         <p className="font-semibold text-slate-900 dark:text-white">Quantity</p>
                         <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-background-light dark:bg-background-dark">
                             <button 
                                onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                             >
                                 <Icon name="remove" className="text-sm" />
                             </button>
                             <span className="px-4 py-2 font-medium text-slate-900 dark:text-white w-12 text-center border-x border-slate-300 dark:border-slate-700">{ticketQuantity}</span>
                             <button 
                                onClick={() => setTicketQuantity(Math.min(4, ticketQuantity + 1))}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                             >
                                 <Icon name="add" className="text-sm" />
                             </button>
                         </div>
                     </div>

                     <button 
                        onClick={handleJoinQueue}
                        className="w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-lg font-bold text-white bg-primary hover:bg-[var(--color-primary-hover)] transition-all hover:-translate-y-1"
                     >
                         Find Tickets
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
