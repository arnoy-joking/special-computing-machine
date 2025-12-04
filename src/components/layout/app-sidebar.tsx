"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Library, Music, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Listen Now", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    // Special case for search, don't navigate, just activate
    if (href === '/search') {
      // In a real app, this might open a search overlay or focus the search input
      // For now, we'll just navigate to a search page
      router.push('/search');
    } else {
      router.push(href);
    }
  }

  return (
    <aside
      id="sidebar"
      className={cn(
        "relative hidden sm:flex w-64 bg-[#000] flex-col p-6 border-r border-border h-full z-20 shrink-0"
      )}
    >
      <div className="flex items-center space-x-2 mb-10">
        <Wind className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold tracking-tight">NodeMusic</span>
      </div>
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Menu</p>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = (pathname === item.href) || (item.href === "/" && pathname.startsWith('/explore'));
          return (
            <a
              href={item.href}
              key={item.label}
              onClick={(e) => handleNav(e, item.href)}
              className={cn(
                  "nav-item flex items-center space-x-3 p-3 rounded-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="mt-auto bg-card p-4 rounded-lg">
        <h4 className="font-semibold text-foreground">Upgrade to Pro</h4>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Get unlimited skips and an ad-free experience.</p>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Upgrade</Button>
      </div>
    </aside>
  );
}
