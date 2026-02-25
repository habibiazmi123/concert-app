'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { useQueueStatus } from '@/hooks/queries/useBookings';

function WaitroomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || '';

  const { data: queueStatus, isLoading } = useQueueStatus(jobId, !!jobId);

  const status = queueStatus?.status || 'WAITING';
  const position = queueStatus?.position ?? null;
  const bookingId = queueStatus?.bookingId;

  useEffect(() => {
    if (status === 'COMPLETED' && bookingId) {
      router.push(`/checkout?bookingId=${bookingId}`);
    }
  }, [status, bookingId, router]);

  const getProgress = () => {
    if (status === 'COMPLETED') return 100;
    if (status === 'PROCESSING') return 75;
    if (status === 'WAITING') {
      if (position === null || position <= 1) return 50;
      return Math.max(10, Math.min(50, 50 - (position - 1) * 5));
    }
    return 0;
  };

  const progress = getProgress();

  const statusLabel = (() => {
    switch (status) {
      case 'WAITING': return 'In Queue';
      case 'PROCESSING': return 'Processing...';
      case 'COMPLETED': return 'Redirecting...';
      case 'FAILED': return 'Failed';
      default: return status;
    }
  })();

  if (!jobId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="error" className="text-5xl text-secondary" />
        <p className="text-lg text-ink-muted font-medium">No queue job found.</p>
        <button onClick={() => router.push('/concerts')} className="btn-brutal btn-ghost text-sm">
          Browse concerts
        </button>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Icon name="cancel" className="text-5xl text-secondary" />
        <p className="text-lg text-ink-muted font-medium">Booking failed. {queueStatus?.errorMsg || 'Please try again.'}</p>
        <button onClick={() => router.push('/concerts')} className="btn-brutal btn-ghost text-sm">
          Back to concerts
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-2xl card-brutal-static p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/10 border-2 border-border-brutal mb-6">
            {status === 'COMPLETED' ? (
              <Icon name="check_circle" className="text-4xl text-accent" />
            ) : status === 'PROCESSING' ? (
              <Icon name="sync" className="text-4xl text-primary animate-spin" />
            ) : (
              <Icon name="hourglass_top" className="text-4xl text-accent-yellow animate-pulse" />
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-ink mb-3">
            {status === 'COMPLETED' ? 'Booking Confirmed!' : status === 'PROCESSING' ? 'Processing Your Booking' : 'You are in the queue'}
          </h1>
          <p className="text-ink-muted text-lg">
            {status === 'COMPLETED' ? 'Redirecting to checkout...' : status === 'PROCESSING' ? 'Securing your seats now...' : 'Please do not refresh this page. You will be redirected automatically.'}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-surface-alt border-2 border-border-brutal/30 rounded-xl p-6 text-center">
            <p className="text-sm text-ink-muted font-bold uppercase tracking-wider mb-2">Status</p>
            <p className={`text-2xl font-bold font-heading tracking-tight ${status === 'COMPLETED' ? 'text-accent' : status === 'PROCESSING' ? 'text-accent-yellow' : 'text-ink'}`}>
              {isLoading ? '...' : statusLabel}
            </p>
          </div>
          <div className="bg-surface-alt border-2 border-border-brutal/30 rounded-xl p-6 text-center">
            <p className="text-sm text-ink-muted font-bold uppercase tracking-wider mb-2">
              {position !== null && position > 0 ? 'People Ahead' : 'Position'}
            </p>
            <p className="text-4xl font-bold font-heading text-ink tracking-tight">
              {isLoading ? '...' : position !== null && position > 0 ? position : '—'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-ink-muted">Queue Progress</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-4 w-full bg-surface-alt border-2 border-border-brutal rounded-xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out rounded-xl"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink-light mt-3 text-center">
            Queue ID: <span className="font-mono text-ink-muted">{jobId.slice(0, 8)}...</span>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center max-w-md">
        <p className="text-sm text-ink-light">
          To ensure a fair experience for all fans, we process bookings in the order they join. Leaving this page will lose your spot.
        </p>
      </div>
    </div>
  );
}

export default function WaitroomPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 rounded-xl border-4 border-border-brutal border-t-primary animate-spin"></div></div>}>
      <WaitroomContent />
    </Suspense>
  );
}
