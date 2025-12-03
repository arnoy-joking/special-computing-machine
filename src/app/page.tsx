"use client";

import { useEffect, useState } from "react";
import { useLibraryStore, usePlayerStore, useUIStore } from "@/lib/store";
import { feedGenerator } from "@/lib/feed-generator";
import { Button } from "@/components/ui/button";
import { Track } from "@/lib/types";
import { Grid, List } from "lucide-react";
import { TrackCard } from "@/components/music/track-card";
import { TrackListItem } from "@/components/music/track-list-item";

export default function Home() {
  const [feed, setFeed] = useState<Track[]>([]);
  const { history, favorites, queueHistory } = useLibraryStore();
  const { viewMode, setViewMode } = useUIStore();
  const playFromSearch = usePlayerStore((s) => s.playFromSearch);

  useEffect(() => {
    const generatedFeed = feedGenerator.generate(history, favorites, queueHistory);
    setFeed(generatedFeed);
  }, [history, favorites, queueHistory]);
  
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

  if (feed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <svg className="w-24 h-24 text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
        <h2 className="text-3xl font-bold mb-3 text-white">Welcome to Music</h2>
        <p className="text-gray-400 text-lg mb-2">Start your journey by searching for songs</p>
        <p className="text-gray-500 text-sm">Play music to help us build a personalized feed just for you</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">For You</h2>
          <p className="text-sm text-gray-400 mt-1">{feed.length} personalized songs</p>
        </div>
        {createViewModeToggle()}
      </div>
      {viewMode === 'grid' ? (
        <div id="feed-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {feed.map((track) => (
            <TrackCard key={track.videoId} track={track} onPlay={() => playFromSearch(track)} />
          ))}
        </div>
      ) : (
        <div id="feed-list" className="space-y-2">
          {feed.map((track) => (
            <TrackListItem key={track.videoId} track={track} onPlay={() => playFromSearch(track)} />
          ))}
        </div>
      )}
    </div>
  );
}
