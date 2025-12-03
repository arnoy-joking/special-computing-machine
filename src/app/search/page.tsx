"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Track } from "@/lib/types";
import { TrackListItem } from "@/components/music/track-list-item";
import { TrackCard } from "@/components/music/track-card";
import { usePlayerStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4 p-3">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const playFromSearch = usePlayerStore((s) => s.playFromSearch);
  const { viewMode, setViewMode } = useUIStore();
  
  useEffect(() => {
    if (query) {
      setLoading(true);
      setTracks([]);
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
          setTracks(data.results || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setTracks([]);
    }
  }, [query]);

  const playableTracks = tracks.filter(t => t.duration && !t.duration.includes('m') && !t.duration.includes('h'));

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

  return (
    <div>
      {!query && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <h3 className="text-xl font-semibold text-white">Search for Music</h3>
          <p className="mt-2">Find your favorite songs, artists, and albums.</p>
        </div>
      )}
      
      {query && (
         <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Results for &quot;{query}&quot;</h2>
              {!loading && playableTracks.length > 0 && createViewModeToggle()}
            </div>
            {loading && <SearchSkeleton />}
            {!loading && playableTracks.length === 0 && (
              <div className="text-gray-500 col-span-full text-center py-10">No results found.</div>
            )}
            {!loading && playableTracks.length > 0 && (
              viewMode === 'grid' ? (
                <div id="results-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {playableTracks.map(track => (
                    <TrackCard key={track.videoId} track={track} onPlay={() => playFromSearch(track)} />
                  ))}
                </div>
              ) : (
                <div id="results-list" className="space-y-2">
                  {playableTracks.map(track => (
                    <TrackListItem key={track.videoId} track={track} onPlay={() => playFromSearch(track)} />
                  ))}
                </div>
              )
            )}
         </div>
      )}
    </div>
  );
}

