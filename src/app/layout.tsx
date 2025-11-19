"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/layout/app-sidebar';
import PlayerFooter from '@/components/layout/player-footer';
import { ClientProviders } from '@/components/client-providers';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
            <main
              className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden pb-24 transition-all duration-300 ease-in-out",
                 isClient && isSidebarOpen ? "pl-64" : "pl-0"
              )}
            >
               <div className="p-4 fixed top-4 left-4 z-50">
                   <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className={cn(isClient && isSidebarOpen && "translate-x-64 transition-transform duration-300 ease-in-out")}
                    >
                      {isClient && isSidebarOpen ? <X /> : <Menu />}
                    </Button>
                </div>
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
