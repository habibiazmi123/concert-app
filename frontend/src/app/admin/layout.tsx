'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth';
import { Icon } from '@/components/ui/Icon';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { name: 'Concerts', href: '/admin/concerts', icon: 'theater_comedy' },
    { name: 'Tickets', href: '/admin/tickets', icon: 'local_activity' },
    { name: 'Bookings', href: '/admin/bookings', icon: 'receipt_long' },
    { name: 'Queue', href: '/admin/queue', icon: 'group' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'bar_chart' },
    { name: 'Settings', href: '/admin/settings', icon: 'settings' },
  ];

  return (
    <ProtectedRoute adminOnly>
      <div className="flex h-screen bg-background overflow-hidden">
        
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-ink/30 lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r-2 border-border-brutal transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center px-5 border-b-2 border-border-brutal">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center">
                <Icon name="confirmation_number" className="text-lg text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight font-heading text-ink">Admin</span>
            </Link>
          </div>

          <div className="h-[calc(100%-4rem)] overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              <p className="px-3 text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                Management
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-accent-yellow border-2 border-border-brutal shadow-brutal-sm text-ink' 
                        : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
                    }`}
                  >
                    <Icon name={item.icon} className="text-xl" fill={isActive} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6">
              <p className="px-3 text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                Account
              </p>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-secondary hover:bg-secondary/10 transition-colors"
              >
                <Icon name="logout" className="text-xl" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-surface border-b-2 border-border-brutal z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden w-9 h-9 rounded-lg border-2 border-border-brutal bg-surface hover:bg-surface-alt flex items-center justify-center"
              >
                <Icon name="menu" className="text-xl" />
              </button>
              <h1 className="text-lg font-bold font-heading text-ink hidden sm:block">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative w-9 h-9 rounded-xl border-2 border-border-brutal bg-surface hover:bg-surface-alt flex items-center justify-center transition-colors">
                <Icon name="notifications" className="text-lg" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-secondary border border-surface"></span>
              </button>
              <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center text-white font-bold text-sm font-heading">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
