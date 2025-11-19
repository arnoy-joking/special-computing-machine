"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import Link from "next/link";

export default function Header() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
      setIsSearchOpen(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${suggestion}`);
    setIsSearchOpen(false);
    setSuggestions([]);
  };
  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
      setIsSearchOpen(false);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      fetch(`/api/suggestions?q=${debouncedSearchQuery.trim()}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data));
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, handleClickOutside]);

  return (
    <header className="flex h-20 items-center justify-between bg-card/80 backdrop-blur-lg border-b px-6 shrink-0 z-20">
       <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center" ref={searchContainerRef}>
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 250, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="h-10 pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                 {suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-popover border rounded-md shadow-lg z-10">
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 cursor-pointer hover:bg-accent"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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