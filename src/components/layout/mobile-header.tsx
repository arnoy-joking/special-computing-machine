"use client";

import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import MobileSearchOverlay from "./mobile-search-overlay";

export default function MobileHeader() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </Button>

        <div className="flex-1 mx-4">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground rounded-full"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-5 h-5 mr-3" />
            Search songs, artists...
          </Button>
        </div>
      </header>

      {isSearchOpen && <MobileSearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
