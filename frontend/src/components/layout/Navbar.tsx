'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLogoutMutation } from '@/hooks/queries/useAuth';
import { Icon } from '@/components/ui/Icon';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { mutate: logoutMutate } = useLogoutMutation();

  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border-brutal bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center">
                <Icon name="confirmation_number" className="text-xl text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight font-heading text-ink">LivePass</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/concerts"
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                  pathname === '/concerts'
                    ? 'bg-accent-yellow border-2 border-border-brutal shadow-brutal-sm'
                    : 'hover:bg-surface-alt'
                }`}
              >
                Concerts
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="btn-brutal btn-accent text-xs py-1.5 px-3 hidden sm:flex">
                    <Icon name="dashboard" className="text-sm" />
                    Admin
                  </Link>
                )}
                <div className="relative group/user-menu">
                  <button className="w-9 h-9 rounded-xl bg-accent-pink border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal transition-all">
                    <Icon name="person" className="text-lg text-ink" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 card-brutal-static opacity-0 invisible group-hover/user-menu:opacity-100 group-hover/user-menu:visible transition-all duration-200 flex flex-col py-2 z-50">
                    <Link href="/profile" className="px-4 py-2 text-sm font-medium hover:bg-surface-alt transition-colors">
                      Profile & Bookings
                    </Link>
                    <button
                      onClick={() => logoutMutate()}
                      className="px-4 py-2 text-sm text-left font-medium text-secondary hover:bg-surface-alt transition-colors w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-brutal btn-ghost text-sm py-1.5 hidden md:flex">
                  Log In
                </Link>
                <Link href="/register" className="btn-brutal btn-primary text-sm py-1.5">
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
