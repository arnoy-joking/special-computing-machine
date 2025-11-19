"use client";

import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="flex h-20 items-center justify-between bg-card/80 backdrop-blur-lg border-b px-6 shrink-0 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </Button>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center">
            <AnimatePresence>
            {isSearchOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 250, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <Input
                    type="search"
                    placeholder="Search..."
                    className="h-10 pr-10"
                    />
                </motion.div>
            )}
            </AnimatePresence>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(isSearchOpen && "absolute right-0 text-muted-foreground")}
                >
                <Search />
            </Button>
        </div>
      </div>
    </header>
  );
}
