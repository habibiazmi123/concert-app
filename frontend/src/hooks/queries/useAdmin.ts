import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';

// ─── Types ──────────────────────────────────────────

export interface AnalyticsOverview {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  totalUsers: number;
  totalConcerts: number;
  recentBookings: number;
  conversionRate: string;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  count: number;
}

export interface TopConcert {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  imageUrl?: string | null;
  totalSeats: number;
  soldSeats: number;
  confirmedBookings: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  revenueByMonth: RevenueByMonth[];
  topConcerts: TopConcert[];
}

export interface QueueStatusData {
  counts: {
    waiting: number;
    processing: number;
    completed: number;
    failed: number;
  };
  total: number;
  redis: {
    connectedClients?: string;
    usedMemory?: string;
    error?: string;
  };
  recentJobs: Array<{
    id: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    concert: { title: string };
  }>;
}

// ─── Hooks ──────────────────────────────────────────

export function useAdminAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['admin', 'analytics'],
    queryFn: () => fetcher<AnalyticsData>('/admin/analytics'),
    refetchInterval: 5000, // Live polling every 5s
  });
}

export function useAdminQueueStatus() {
  return useQuery<QueueStatusData>({
    queryKey: ['admin', 'queue-status'],
    queryFn: () => fetcher<QueueStatusData>('/admin/queue-status'),
  });
}
