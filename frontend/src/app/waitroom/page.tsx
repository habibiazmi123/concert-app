'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { useQueueStatus } from '@/hooks/queries/useBookings';

function WaitroomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';

  const { data: queueStatus, isLoading } = useQueueStatus(jobId, !!jobId);

  const status = queueStatus?.status || 'waiting';
  const position = queueStatus?.position ?? 0;

  // Redirect when queue processing is complete
  useEffect(() => {
    if (status === 'completed' && queueStatus?.bookingId) {
      router.push(`/checkout?bookingId=${queueStatus.bookingId}`);
    }
  }, [status, queueStatus?.bookingId, router]);

  // Calculate progress based on status
  const getProgress = () => {
    if (status === 'completed') return 100;
    if (status === 'active') return 80;
    if (status === 'waiting' || status === 'delayed') {
      if (position <= 0) return 50;
      return Math.max(10, Math.min(60, 60 - position * 5));
    }
    return 0;
  };

  const progress = getProgress();

  if (!jobId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error" className="text-5xl text-red-500" />
        <p className="text-lg text-slate-600 dark:text-slate-400">No queue job found.</p>
        <button onClick={() => router.push('/concerts')} className="text-primary hover:underline">
          Browse concerts
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="cancel" className="text-5xl text-red-500" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Booking failed. {queueStatus?.error || 'Please try again.'}</p>
        <button onClick={() => router.push('/concerts')} className="text-primary hover:underline">
          Back to concerts
        </button>
      </div>
    );
  }

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
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Status</p>
                <p className="text-2xl font-bold text-white tracking-tight capitalize">
                  {isLoading ? '...' : status}
                </p>
            </div>
             <div className="bg-black/20 dark:bg-black/40 border border-white/5 rounded-2xl p-6 text-center backdrop-blur-md">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">Position</p>
                <p className="text-4xl font-bold text-white tracking-tight">
                  {isLoading ? '...' : position > 0 ? `#${position}` : '—'}
                </p>
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
                 Your queue job ID: <span className="font-mono text-slate-300">{jobId}</span>
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

export default function WaitroomPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <WaitroomContent />
    </Suspense>
  );
}
