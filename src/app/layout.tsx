import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/layout/app-sidebar';
import PlayerFooter from '@/components/layout/player-footer';
import { ClientProviders } from '@/components/client-providers';

export const metadata: Metadata = {
  title: 'NodeMusic',
  description: 'Listen to your favorite music',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased overflow-hidden">
        <ClientProviders>
          <div className="relative flex h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden pl-64 pb-24">
              {children}
            </main>
            <PlayerFooter />
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
