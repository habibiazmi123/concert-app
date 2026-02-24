import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';
import type { Concert, PaginatedResponse, ConcertQuery } from '@/lib/types';

export const concertKeys = {
  all: ['concerts'] as const,
  lists: () => [...concertKeys.all, 'list'] as const,
  list: (query: ConcertQuery) => [...concertKeys.lists(), query] as const,
  details: () => [...concertKeys.all, 'detail'] as const,
  detail: (id: string) => [...concertKeys.details(), id] as const,
};

export const useConcerts = (query: ConcertQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.city) params.set('city', query.city);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);

  const queryString = params.toString();
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
