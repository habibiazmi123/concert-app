'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useLogoutMutation } from '@/hooks/queries/useAuth';
import { Icon } from '@/components/ui/Icon';

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const { mutate: logoutMutate } = useLogoutMutation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Icon name="confirmation_number" className="text-3xl" />
              <span className="text-xl font-bold tracking-tight dark:text-white">LivePass</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/concerts" className="text-sm font-medium hover:text-primary transition-colors">
                Concerts
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                 {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
                    >
                      Admin Dashboard
                    </Link>
                 )}
                <div className="relative group/user-menu">
                   <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                     <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700">
                        <Icon name="person" className="text-[20px]" />
                     </div>
                   </button>
                   <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover/user-menu:opacity-100 group-hover/user-menu:visible transition-all duration-200 flex flex-col py-2">
                       <Link href="/profile" className="px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Profile & Bookings</Link>
                       <button onClick={() => logoutMutate()} className="px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full">Sign Out</button>
                   </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-[var(--color-primary-hover)] rounded-lg shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
