'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initializeFromToken } = useAuthStore();

  useEffect(() => {
    initializeFromToken();
  }, [initializeFromToken]);

  return <>{children}</>;
}
