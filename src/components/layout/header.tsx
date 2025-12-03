"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

export default function Header() {
  const { setSidebarOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${suggestion}`);
    setSuggestions([]);
  };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchContainerRef]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      fetch(`/api/suggestions?q=${debouncedSearchQuery.trim()}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data.slice(1, 7)));
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  return (
    <header className="h-16 flex items-center px-4 sticky top-0 z-10 bg-[#030303]/95 backdrop-blur border-b border-[#212121] flex-shrink-0">
      <div className="flex items-center w-full space-x-3">
        <Button
          id="menu-btn"
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="text-white hover:bg-[#212121] p-2 rounded-lg transition"
        >
          <Menu />
        </Button>
        <div className="relative flex-1 max-w-2xl" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit}>
            <Input
              type="search"
              id="search-input"
              placeholder="Search songs, artists..."
              className="w-full bg-[#212121] text-white rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-gray-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </form>
          <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#282828] border border-[#333] rounded-md shadow-lg z-20">
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-[#333] text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
          U
        </div>
      </div>
    </header>
  );
}
