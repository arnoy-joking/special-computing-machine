"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Library, Wind, Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store";
import { SearchInput } from "../search-input";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/", label: "Listen Now", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    router.push(href);
  }

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = (pathname === item.href);
    const linkContent = (
      <a
        href={item.href}
        onClick={(e) => handleNav(e, item.href)}
        className={cn(
          "nav-item flex items-center space-x-3 p-3 rounded-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          isSidebarCollapsed && "justify-center"
        )}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        <span className={cn("transition-opacity", isSidebarCollapsed && "opacity-0 hidden")}>{item.label}</span>
      </a>
    );

    if (isSidebarCollapsed) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return linkContent;
  }

  return (
    <aside
      id="sidebar"
      className={cn(
        "fixed sm:relative top-0 left-0 h-full bg-[#000] flex-col p-4 border-r border-border z-30 shrink-0 transition-all duration-300 ease-in-out flex",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "sm:translate-x-0",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}
    >
      <div className={cn("flex items-center space-x-2 mb-6 transition-all", isSidebarCollapsed ? 'justify-center' : 'justify-start' )}>
        <Wind className="w-8 h-8 text-primary shrink-0" />
        <span className={cn("text-2xl font-bold tracking-tight transition-opacity", isSidebarCollapsed && "opacity-0 hidden")}>NodeMusic</span>
      </div>

      <div className={cn("mb-6 transition-opacity", isSidebarCollapsed && "opacity-0 hidden pointer-events-none")}>
        <SearchInput />
      </div>

      <p className={cn("text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 transition-opacity", isSidebarCollapsed && "opacity-0 hidden")}>Menu</p>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>

      <div className="mt-auto">
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        onClick={toggleSidebarCollapse}
                        className={cn("w-full justify-center text-muted-foreground hover:text-foreground hover:bg-secondary", !isSidebarCollapsed && "justify-end")}
                    >
                        <ChevronLeft className={cn("w-5 h-5 transition-transform", isSidebarCollapsed && "rotate-180")} />
                        <span className="sr-only">{isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                    <p>{isSidebarCollapsed ? 'Expand' : 'Collapse'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
