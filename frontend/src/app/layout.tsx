import type { Metadata } from 'next';
import { Spline_Sans } from 'next/font/google';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import QueryProvider from '@/providers/QueryProvider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

import './globals.css';

const splineSans = Spline_Sans({
  variable: '--font-spline-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LivePass | Concert Ticket Booking',
  description: 'Book your tickets for the best concerts in town!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${splineSans.variable} font-display antialiased text-slate-900 dark:text-slate-100 bg-background-light dark:bg-background-dark min-h-screen flex flex-col selection:bg-[#135bec]/30`} >
        <QueryProvider>
          <AuthInitializer>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
