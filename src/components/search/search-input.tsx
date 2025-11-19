"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchInput() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        type="search"
        placeholder="Search for songs, albums, artists..."
        className="pl-10 h-12 text-lg rounded-full bg-secondary border-transparent focus:bg-card focus:border-primary focus:ring-primary"
      />
    </div>
  );
}
