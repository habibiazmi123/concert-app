import { useMutation } from '@tanstack/react-query';
import { poster } from '@/lib/fetcher';
import { useAuthStore } from '@/store/auth';
import type { AuthResponse } from '@/lib/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const useLoginMutation = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      return poster<AuthResponse>('/auth/login', credentials);
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
    },
  });
};

export const useRegisterMutation = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => {
      return poster<AuthResponse>('/auth/register', credentials);
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      return poster<{ message: string }>('/auth/logout');
    },
    onSuccess: () => {
      logout();
    },
    onError: () => {
      // Even if the API call fails, clear local state
      logout();
    },
  });
};
