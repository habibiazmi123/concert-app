import { create } from 'zustand';
import type { User } from '@/lib/types';
import { fetcher } from '@/lib/fetcher';

export type { User };

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initializeFromToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  initializeFromToken: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await fetcher<User>('/users/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token is invalid or expired (interceptor will try refresh)
      // If still fails, clear everything
      if (!get().isAuthenticated) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },
}));
