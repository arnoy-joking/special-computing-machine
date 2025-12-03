"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Home, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: Home, view: 'home' },
  { href: "/explore", label: "Explore", icon: Compass, view: 'explore' },
  { href: "/library", label: "Favorites", icon: Heart, view: 'favorites' },
];

export default function AppSidebar() {
  const { isSidebarOpen, setSidebarOpen, currentView, setCurrentView } = useUIStore();
  const router = useRouter();

  const handleNav = (e: React.MouseEvent, view: string, href: string) => {
    e.preventDefault();
    setCurrentView(view);
    if(view === 'home') router.push('/');
    else if(view === 'favorites') router.push('/library');
    else if(view === 'explore') {
        // For now, explore can just redirect to home or a placeholder
        router.push('/');
    }

    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  }

  return (
    <>
      <div id="sidebar-overlay" className={cn("fixed inset-0 bg-black/60 z-20 sm:hidden", isSidebarOpen ? 'block' : 'hidden')} onClick={() => setSidebarOpen(false)}></div>
      <aside
        id="sidebar"
        className={cn(
          "fixed sm:relative w-60 bg-[#0f0f0f] flex flex-col p-4 border-r border-[#212121] h-full z-30 transform transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center space-x-2">
              <img src="https://img.icons8.com/?size=100&id=YNioBT5SxQw3&format=png&color=000000" className="w-8 h-8" alt="logo" />
              <span className="text-xl font-bold tracking-tighter">Music</span>
          </Link>
          <button id="close-sidebar-btn" className="sm:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <a
                href={item.href}
                key={item.label}
                onClick={(e) => handleNav(e, item.view, item.href)}
                className={cn(
                    "nav-item flex items-center space-x-4 p-3 rounded-lg text-gray-400 hover:bg-[#212121] transition-all",
                    isActive && "active bg-[#212121] text-white font-semibold"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
