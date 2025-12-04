
"use client";

import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";

export function SearchInput() {
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
        .then(data => {
            setSuggestions(data);
            if(data.length > 0) setIsPopoverOpen(true);
        })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
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
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onFocus={() => {
                if (suggestions.length > 0) {
                    setIsPopoverOpen(true);
                }
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-none rounded-lg pl-10 pr-4 py-2 text-sm h-11 focus:ring-2 focus:ring-primary"
          />
        </form>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
         {suggestions.length > 0 && (
             <ul className="py-2">
                {suggestions.map((s, i) => (
                   <li 
                      key={i} 
                      className="px-4 py-2 hover:bg-secondary cursor-pointer text-sm"
                      onMouseDown={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </li>
                ))}
              </ul>
         )}
      </PopoverContent>
    </Popover>
  );
}
