"use client";

import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useEffect, useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function MobileHeader() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debouncedSearchQuery.length > 1) {
      fetch(`/api/suggestions?q=${debouncedSearchQuery}`)
        .then(res => res.json())
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
      setSearchQuery("");
      setIsPopoverOpen(false);
      inputRef.current?.blur();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${suggestion}`);
    setIsPopoverOpen(false);
    inputRef.current?.blur();
  };

  return (
    <header className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-20">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="w-6 h-6" />
      </Button>

      <div className="flex-1 mx-4">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary"
              />
            </form>
          </PopoverTrigger>
          {suggestions.length > 0 && (
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <ul className="py-2">
                {suggestions.map((s, i) => (
                   <li 
                      key={i} 
                      className="px-4 py-2 hover:bg-secondary cursor-pointer"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </li>
                ))}
              </ul>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </header>
  );
}
