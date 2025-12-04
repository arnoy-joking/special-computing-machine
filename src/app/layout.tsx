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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isQueueOpen = useUIStore((state) => state.isQueueOpen);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>NodeMusic</title>
        <meta name="description" content="Your daily dose of music, curated just for you." />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50,10 a40,40 0 1,0 0,80 a40,40 0 1,0 0,-80' fill='%2366f0f0'/%3E%3C/svg%3E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground h-screen flex flex-col font-sans overflow-hidden">
        <ClientProviders>
          <VideoPlayer />
          <div className="flex flex-1 overflow-hidden pb-20">
            <AppSidebar />
            <main className="flex-1 flex flex-col bg-background overflow-hidden">
              <section id="content-section" className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 lg:p-10">
                <Template>{children}</Template>
              </section>
            </main>
            <div className={cn("transition-all duration-300", isQueueOpen ? 'w-full md:w-96' : 'w-0')}>
              <QueuePanel />
            </div>
          </div>
          <PlayerFooter />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
