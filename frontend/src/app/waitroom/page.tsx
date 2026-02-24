'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';

export default function WaitroomPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState(1458);
  const [estimatedWait, setEstimatedWait] = useState(15); // minutes
  const [queueId, setQueueId] = useState('');

  // Mocking queue progress
  useEffect(() => {
    setQueueId(`Q-${Math.random().toString(36).substring(2, 11).toUpperCase()}`);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          router.push('/checkout');
          return 100;
        }
        return prev + 1;
      });
      
      setPosition(prev => Math.max(0, prev - 15));
      setEstimatedWait(() => Math.max(0, Math.ceil((100 - progress) * 0.15)));

    }, 2000);

    return () => clearInterval(interval);
  }, [progress, router]);

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 sm:px-6 lg:px-8 overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 via-background-dark/40 to-background-dark dark:from-background-dark/80 dark:via-background-dark/40 dark:to-background-dark" />
         <Image
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80"
            alt="Atmospheric concert"
            fill
            className="object-cover"
          />
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
         {/* Animated Top Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-75 blur-[2px]" />

        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border border-primary/30 mb-6 shadow-[0_0_20px_rgba(19,91,236,0.2)]">
               <Icon name="hourglass_top" className="text-4xl text-primary animate-pulse" />
           </div>
           <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">You are in the queue</h1>
           <p className="text-slate-300 text-lg">Please do not refresh this page. You will be redirected automatically.</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-black/20 dark:bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-md">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">People ahead of you</p>
                <p className="text-4xl font-bold text-white tracking-tight">{position.toLocaleString()}</p>
            </div>
             <div className="bg-black/20 dark:bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-md">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Estimated wait time</p>
                <div className="flex items-end justify-center gap-1">
                    <p className="text-4xl font-bold text-white tracking-tight">{estimatedWait}</p>
                    <span className="text-slate-400 font-medium mb-1">min</span>
                </div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
            <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-medium text-slate-300">Queue Progress</span>
                 <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/10">
                 <div 
                    className="h-full bg-primary shadow-[0_0_10px_rgba(19,91,236,0.6)] transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }} 
                 />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
                 Your unique queue ID: <span className="font-mono text-slate-300">{queueId}</span>
            </p>
        </div>
      </div>

       <div className="relative z-10 mt-8 text-center max-w-md">
           <p className="text-sm text-slate-400">
             To ensure a fair experience for all fans, we process bookings in the order they join. Leaving this page will lose your spot.
           </p>
       </div>
    </div>
  );
}
