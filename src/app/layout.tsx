"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/layout/app-sidebar';
import PlayerFooter from '@/components/layout/player-footer';
import { ClientProviders } from '@/components/client-providers';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSidebarOpen } = useUIStore();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>NodeMusic</title>
        <meta name="description" content="Listen to your favorite music" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased overflow-hidden">
        <ClientProviders>
          <div className="relative flex h-screen w-full">
            <AppSidebar />
            <div className={cn(
                "flex flex-col flex-1 transition-all duration-300 ease-in-out",
                isSidebarOpen ? "ml-64" : "ml-0"
              )}>
              <Header />
              <main
                className="flex-1 overflow-y-auto overflow-x-hidden pb-24"
              >
                {children}
              </main>
            </div>
            <PlayerFooter />
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
