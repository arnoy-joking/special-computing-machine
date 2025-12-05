"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/layout/app-sidebar';
import PlayerFooter from '@/components/layout/player-footer';
import { ClientProviders } from '@/components/client-providers';
import VideoPlayer from '@/components/player/video-player';
import QueuePanel from '@/components/layout/queue-panel';
import Template from './template';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import MobileHeader from '@/components/layout/mobile-header';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isQueueOpen = useUIStore((state) => state.isQueueOpen);
  const { isSidebarOpen, toggleSidebar, isSidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSidebarOpen]);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>NodeMusic</title>
        <meta name="description" content="Your daily dose of music, curated just for you." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="https://www.nicepng.com/png/full/358-3582537_best-apollo-icon-android-lollipop-png-play-music.png" type="image/png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground h-dvh flex flex-col font-sans overflow-x-hidden">
        <ClientProviders>
          <VideoPlayer />
          <div className="flex flex-1 overflow-hidden relative">
             {isSidebarOpen && <div onClick={toggleSidebar} className="sm:hidden fixed inset-0 bg-black/60 z-20" />}
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden pb-20">
              <MobileHeader />
              <main className="flex-1 flex flex-col bg-background overflow-hidden">
                <section id="content-section" className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
                  <Template>{children}</Template>
                </section>
              </main>
            </div>
            <QueuePanel />
          </div>
          <PlayerFooter />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
