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
    { name: 'Dashboard Overview', href: '/admin', icon: 'dashboard' },
    { name: 'Concerts & Events', href: '/admin/concerts', icon: 'theater_comedy' },
    { name: 'Ticket Management', href: '/admin/tickets', icon: 'local_activity' },
    { name: 'Booking Logs', href: '/admin/bookings', icon: 'receipt_long' },
    { name: 'Queue Monitor', href: '/admin/queue', icon: 'group' },
    { name: 'Analytics', href: '/admin/analytics', icon: 'bar_chart' },
    { name: 'Settings', href: '/admin/settings', icon: 'settings' },
  ];

  return (
    <ProtectedRoute adminOnly>
      <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display text-slate-900 dark:text-slate-100">
        
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-border-dark">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Icon name="confirmation_number" className="text-3xl" />
              <span className="text-xl font-bold tracking-tight dark:text-white">LivePass Admin</span>
            </Link>
          </div>

          <div className="h-[calc(100%-4rem)] overflow-y-auto py-6 px-4 custom-scrollbar">
            <nav className="space-y-1">
              <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Management
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon name={item.icon} className={`text-xl ${isActive ? 'text-primary' : ''}`} fill={isActive} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8">
              <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Account
              </p>
              <div className="space-y-1">
                <button
                   onClick={logout}
                   className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <Icon name="logout" className="text-xl" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-border-dark z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Icon name="menu" className="text-2xl" />
              </button>
              {/* Breadcrumb would go here dynamically based on route */}
               <h1 className="text-lg font-semibold text-slate-900 dark:text-white hidden sm:block">
                  Dashboard
               </h1>
            </div>

             <div className="flex items-center gap-4">
               <div className="relative">
                  <Icon name="notifications" className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl cursor-pointer transition-colors" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
               </div>
               <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-medium text-sm">
                  {user?.name?.[0] || 'A'}
               </div>
             </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark custom-scrollbar">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </div>
          </main>
        </div>

      </div>
    </ProtectedRoute>
  );
}
