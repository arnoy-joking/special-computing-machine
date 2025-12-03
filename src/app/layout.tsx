"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/layout/app-sidebar';
import PlayerFooter from '@/components/layout/player-footer';
import { ClientProviders } from '@/components/client-providers';
import { useUIStore } from '@/lib/store';
import Header from '@/components/layout/header';
import VideoPlayer from '@/components/player/video-player';
import QueuePanel from '@/components/layout/queue-panel';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>YtMusic</title>
        <meta name="description" content="Listen to your favorite music" />
        <link rel="icon" type="image/png" href="https://img.icons8.com/?size=100&id=YNioBT5SxQw3&format=png&color=000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0f0f0f] text-white h-screen flex flex-col font-sans overflow-hidden">
        <ClientProviders>
          <VideoPlayer />
          <div className="flex flex-1 overflow-hidden pb-16 sm:pb-20">
            <AppSidebar />
            <main className="flex-1 flex flex-col bg-[#030303] overflow-hidden">
              <Header />
              <section id="content-section" className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
                {children}
              </section>
            </main>
            <QueuePanel />
          </div>
          <PlayerFooter />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
