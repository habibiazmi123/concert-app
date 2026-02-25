import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, poster } from '@/lib/fetcher';
import type { Payment, CreatePaymentRequest, CorePaymentResponse } from '@/lib/types';
import { bookingKeys } from './useBookings';

export const paymentKeys = {
  all: ['payments'] as const,
  detail: (bookingId: string) => [...paymentKeys.all, bookingId] as const,
};

export const useProcessPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => {
      return poster<CorePaymentResponse>('/payments', data);
    },
    onSuccess: () => {
      // Invalidate bookings to refresh status
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
};

export const usePayment = (bookingId: string) => {
  return useQuery({
    queryKey: paymentKeys.detail(bookingId),
    queryFn: () => fetcher<Payment>(`/payments/${bookingId}`),
    enabled: !!bookingId,
  });
};
