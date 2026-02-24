import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, patcher } from '@/lib/fetcher';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/lib/types';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => fetcher<User>('/users/me'),
    enabled: isAuthenticated,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: { name?: string; phone?: string; avatarUrl?: string }) => {
      return patcher<User>('/users/me', data);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};
