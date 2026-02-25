import type { Metadata } from 'next';
import { Comfortaa, IBM_Plex_Mono } from 'next/font/google';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import QueryProvider from '@/providers/QueryProvider';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { Toaster } from 'sonner';

import './globals.css';

const comfortaa = Comfortaa({
  variable: '--font-comfortaa',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
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
    <html lang="en">
      <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${comfortaa.variable} ${ibmPlexMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <QueryProvider>
          <AuthInitializer>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </AuthInitializer>
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
