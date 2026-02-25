'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="border-t-2 border-border-brutal bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary border-2 border-border-brutal shadow-brutal-sm flex items-center justify-center">
                <Icon name="confirmation_number" className="text-xl text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight font-heading text-ink">LivePass</span>
            </Link>
            <p className="text-sm text-ink-muted max-w-sm">
              Your premier destination for booking tickets to the best concerts and live events worldwide. Secure, fast, and reliable.
            </p>
          </div>
          <div>
            <h3 className="font-heading font-bold text-ink mb-4">Discover</h3>
            <ul className="space-y-2">
              <li><Link href="/concerts" className="text-sm text-ink-muted hover:text-primary font-medium transition-colors">All Concerts</Link></li>
              <li><Link href="/venues" className="text-sm text-ink-muted hover:text-primary font-medium transition-colors">Venues</Link></li>
              <li><Link href="/artists" className="text-sm text-ink-muted hover:text-primary font-medium transition-colors">Artists</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-ink mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-ink-muted hover:text-primary font-medium transition-colors">Help Center</Link></li>
              <li><Link href="/terms" className="text-sm text-ink-muted hover:text-primary font-medium transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-ink-muted hover:text-primary font-medium transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-border-brutal mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ink-muted">
            © {new Date().getFullYear()} LivePass. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-9 h-9 rounded-xl border-2 border-border-brutal bg-surface shadow-brutal-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <Icon name="public" className="text-sm" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl border-2 border-border-brutal bg-surface shadow-brutal-sm flex items-center justify-center hover:bg-primary hover:text-white transition-all">
              <Icon name="share" className="text-sm" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
