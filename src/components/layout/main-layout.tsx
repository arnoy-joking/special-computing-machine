
"use client";

import AppSidebar from '@/components/layout/app-sidebar';
import PlayerFooter from '@/components/layout/player-footer';
import VideoPlayer from '@/components/player/video-player';
import QueuePanel from '@/components/layout/queue-panel';
import { useUIStore } from '@/lib/store';
import MobileHeader from '@/components/layout/mobile-header';
import { useEffect } from 'react';
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isQueueOpen = useUIStore((state) => state.isQueueOpen);
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSidebarOpen]);

  return (
    <>
      <VideoPlayer />
      <div className="flex flex-1 overflow-hidden relative">
         {isSidebarOpen && <div onClick={toggleSidebar} className="sm:hidden fixed inset-0 bg-black/60 z-20" />}
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden pb-[6.5rem] sm:pb-20">
          <MobileHeader />
          <main className="flex-1 flex flex-col bg-background overflow-hidden">
            <section id="content-section" className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </section>
          </main>
        </div>
        <QueuePanel />
      </div>
      <PlayerFooter />
    </>
  );
}
