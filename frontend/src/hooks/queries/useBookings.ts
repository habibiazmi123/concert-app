import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, poster } from '@/lib/fetcher';
import type {
  Booking,
  PaginatedResponse,
  BookingQuery,
  CreateBookingRequest,
  EnqueueBookingResponse,
  QueueStatus,
} from '@/lib/types';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (query: BookingQuery) => [...bookingKeys.lists(), query] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  queueStatus: (jobId: string) => [...bookingKeys.all, 'queue', jobId] as const,
};

export const useCreateBookingMutation = () => {
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => {
      return poster<EnqueueBookingResponse>('/bookings', data);
    },
  });
};

export const useQueueStatus = (queueJobId: string, enabled = true) => {
  return useQuery({
    queryKey: bookingKeys.queueStatus(queueJobId),
    queryFn: () => fetcher<QueueStatus>(`/bookings/queue-status/${queueJobId}`),
    enabled: !!queueJobId && enabled,
    refetchInterval: (query) => {
      // Poll every 2 seconds while waiting, stop when completed/failed
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 2000;
    },
  });
};

export const useMyBookings = (query: BookingQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);

  const queryString = params.toString();
  const url = `/bookings/my${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: bookingKeys.list(query),
    queryFn: () => fetcher<PaginatedResponse<Booking>>(url),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetcher<Booking>(`/bookings/${id}`),
    enabled: !!id,
  });
};

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => {
      return poster<Booking>(`/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
};
