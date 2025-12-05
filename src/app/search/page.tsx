
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Track } from "@/lib/types";
import { TrackListItem } from "@/components/music/track-list-item";
import { TrackCard } from "@/components/music/track-card";
import { usePlayerStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

function SearchSkeleton() {
  const { viewMode } = useUIStore();
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
           <div key={i} className="flex items-center space-x-4 p-2">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, j) => (
        <div key={j} className="w-full shrink-0">
          <Skeleton className="w-full aspect-square rounded-lg mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function SearchContent() {
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
    <div className="hidden sm:flex items-center gap-2">
      <span className="text-sm text-muted-foreground">View as:</span>
      <div className="flex bg-card p-1 rounded-lg border">
        <Button
          id="view-grid-btn"
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('grid')}
          className="h-8 w-8"
          title="Grid View"
        >
          <Grid className="w-5 h-5" />
        </Button>
        <Button
          id="view-list-btn"
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
          className="h-8 w-8"
          title="List View"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
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
              <h2 className="text-3xl font-bold">Results for &quot;{query}&quot;</h2>
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
                <div id="results-list" className="border-t border-border">
                  {playableTracks.map(track => (
                    <div key={track.videoId} className="border-b border-border">
                      <TrackListItem track={track} onPlay={() => playFromSearch(track)} />
                    </div>
                  ))}
                </div>
              )
            )}
         </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  )
}
