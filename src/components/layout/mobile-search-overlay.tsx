"use client";

import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { useEffect, useState, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface MobileSearchOverlayProps {
  onClose: () => void;
}

export default function MobileSearchOverlay({ onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.length > 1) {
      setLoading(true);
      fetch(`/api/suggestions?q=${debouncedSearchQuery}`)
        .then(res => res.json())
        .then(data => setSuggestions(data))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery.trim()}`);
      onClose();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${suggestion}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col sm:hidden">
      <div className="flex items-center p-4 border-b border-border flex-shrink-0">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search songs, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border-none rounded-full pl-10 pr-4 py-2.5 text-base focus:ring-2 focus:ring-primary"
          />
           {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          )}
        </form>
        <button onClick={onClose} className="ml-4 text-primary font-medium text-sm">
          Cancel
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {suggestions.length > 0 && (
          <ul className="py-2">
            {suggestions.map((s, i) => (
              <li 
                key={i} 
                className="px-4 py-3 hover:bg-secondary cursor-pointer flex items-center gap-4 text-lg"
                onClick={() => handleSuggestionClick(s)}
              >
                <Search className="w-5 h-5 text-muted-foreground" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
