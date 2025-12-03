"use client";

import { useLibraryStore, usePlayerStore, useUIStore } from "@/lib/store";
import { Grid, List, Heart } from "lucide-react";
import { Track } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TrackCard } from "@/components/music/track-card";
import { TrackListItem } from "@/components/music/track-list-item";

export default function LibraryPage() {
  const { favorites } = useLibraryStore();
  const playFromSearch = usePlayerStore((s) => s.playFromSearch);
  const { viewMode, setViewMode } = useUIStore();

  const createViewModeToggle = () => (
    <div className="flex bg-[#212121] rounded-lg p-1">
      <Button
        id="view-grid-btn"
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
        title="Grid View"
      >
        <Grid className="w-5 h-5" />
      </Button>
      <Button
        id="view-list-btn"
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
        title="List View"
      >
        <List className="w-5 h-5" />
      </Button>
    </div>
  );

  const lovedSongs = [...favorites].reverse();

  if (lovedSongs.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <Heart className="w-24 h-24 text-gray-600 mb-6" />
          <h2 className="text-3xl font-bold mb-3 text-white">No Favorites Yet</h2>
          <p className="text-gray-400 text-lg">Tap the heart icon on songs you love to save them here</p>
      </div>
    );
  }
  
  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold">Favorites</h2>
                <p className="text-sm text-gray-400 mt-1">{lovedSongs.length} loved songs</p>
            </div>
            {createViewModeToggle()}
        </div>

        {viewMode === 'grid' ? (
            <div id="favorites-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {lovedSongs.map((track) => (
                <TrackCard key={track.videoId} track={track} onPlay={() => playFromSearch(track)} />
            ))}
            </div>
        ) : (
            <div id="favorites-list" className="space-y-2">
            {lovedSongs.map((track) => (
                <TrackListItem key={track.videoId} track={track} onPlay={() => playFromSearch(track)} showFavoriteButton />
            ))}
            </div>
        )}
    </div>
  );
}
