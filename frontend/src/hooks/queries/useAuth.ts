import { useMutation } from '@tanstack/react-query';
import { poster } from '@/lib/fetcher';
import { useAuthStore, User } from '@/store/auth';

export const useLoginMutation = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      return poster<{ user: User; access_token: string; refresh_token: string }>('/auth/login', credentials);
    },
    onSuccess: (data: { user: User; access_token: string; refresh_token: string }) => {
      login(data.user, data.access_token, data.refresh_token);
    },
  });
};

export const useRegisterMutation = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      return poster<{ user: User; access_token: string; refresh_token: string }>('/auth/register', credentials);
    },
    onSuccess: (data: { user: User; access_token: string; refresh_token: string }) => {
      login(data.user, data.access_token, data.refresh_token);
    },
  });
};
