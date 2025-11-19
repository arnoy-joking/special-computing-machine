"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Mic2, Music, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Listen Now", icon: Music },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-black/30 backdrop-blur-lg border-r border-white/10 p-6 flex flex-col z-40">
      <div className="flex items-center gap-2 mb-10">
        <Mic2 className="text-accent" size={32} />
        <h1 className="text-2xl font-bold text-white">NodeMusic</h1>
      </div>
      <nav className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.label}
              variant={isActive ? "secondary" : "ghost"}
              asChild
              className={cn("justify-start", isActive && "text-accent-foreground bg-accent hover:bg-accent/80")}
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5 text-accent" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="bg-white/10 p-4 rounded-lg text-center">
            <h3 className="font-bold">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1">Get unlimited skips and an ad-free experience.</p>
            <Button size="sm" className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/80">Upgrade</Button>
        </div>
      </div>
    </aside>
  );
}
