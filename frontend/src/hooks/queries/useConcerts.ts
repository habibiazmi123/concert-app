import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, poster, patcher, deleter } from '@/lib/fetcher';
import type { Concert, PaginatedResponse, ConcertQuery } from '@/lib/types';

export const concertKeys = {
  all: ['concerts'] as const,
  lists: () => [...concertKeys.all, 'list'] as const,
  list: (query: ConcertQuery) => [...concertKeys.lists(), query] as const,
  adminLists: () => [...concertKeys.all, 'admin-list'] as const,
  adminList: (query: ConcertQuery) => [...concertKeys.adminLists(), query] as const,
  details: () => [...concertKeys.all, 'detail'] as const,
  detail: (id: string) => [...concertKeys.details(), id] as const,
};

function buildQueryString(query: ConcertQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.city) params.set('city', query.city);
  if (query.status) params.set('status', query.status);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  return params.toString();
}

// ─── Public Hooks ───────────────────────────────────

export const useConcerts = (query: ConcertQuery = {}) => {
  const queryString = buildQueryString(query);
  const url = `/concerts${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: concertKeys.list(query),
    queryFn: () => fetcher<PaginatedResponse<Concert>>(url),
  });
};

export const useConcert = (id: string) => {
  return useQuery({
    queryKey: concertKeys.detail(id),
    queryFn: () => fetcher<Concert>(`/concerts/${id}`),
    enabled: !!id,
  });
};

// ─── Admin Hooks ────────────────────────────────────

export const useAdminConcerts = (query: ConcertQuery = {}) => {
  const queryString = buildQueryString(query);
  const url = `/concerts/admin/all${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: concertKeys.adminList(query),
    queryFn: () => fetcher<PaginatedResponse<Concert>>(url),
  });
};

interface CreateConcertInput {
  title: string;
  description: string;
  artist: string;
  venue: string;
  address: string;
  city: string;
  date: string;
  imageUrl?: string;
  status?: string;
  ticketTypes: {
    name: string;
    description?: string;
    price: number;
    totalSeats: number;
    sortOrder?: number;
  }[];
}

export const useCreateConcert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConcertInput) =>
      poster<Concert>('/concerts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concertKeys.all });
    },
  });
};

export const useUpdateConcert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateConcertInput> }) =>
      patcher<Concert>(`/concerts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concertKeys.all });
    },
  });
};

export const useDeleteConcert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleter<{ message: string }>(`/concerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: concertKeys.all });
    },
  });
};

export const useUploadUrl = () => {
  return useMutation({
    mutationFn: async ({ concertId, fileType }: { concertId: string; fileType: string }) => {
      return fetcher<{ uploadUrl: string; publicUrl: string; key: string }>(
        `/concerts/${concertId}/upload-url?fileType=${encodeURIComponent(fileType)}`,
      );
    },
  });
};

