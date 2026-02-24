'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export function Footer() {
  const pathname = usePathname();

  // Hide Footer on admin routes (admin has its own layout)
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-primary mb-4">
              <Icon name="confirmation_number" className="text-3xl" />
              <span className="text-xl font-bold tracking-tight dark:text-white">LivePass</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
              Your premier destination for booking tickets to the best concerts and live events worldwide. Secure, fast, and reliable.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Discover</h3>
            <ul className="space-y-2">
              <li><Link href="/concerts" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">All Concerts</Link></li>
              <li><Link href="/venues" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Venues</Link></li>
              <li><Link href="/artists" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Artists</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} LivePass. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            {/* Social Icons Placeholders */}
            <a href="#" className="hover:text-primary transition-colors"><Icon name="public" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Icon name="share" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
