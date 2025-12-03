"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Track } from "@/lib/types";
import { TrackList } from "@/components/music/track-list";

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12" />
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
  
  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
          setTracks(data);
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!query && (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Search for Music</h3>
          <p className="text-muted-foreground mt-2">Find your favorite songs, albums, and artists.</p>
        </div>
      )}
      
      {loading && <SearchSkeleton />}

      {tracks.length > 0 && !loading && (
         <div>
            <h2 className="text-3xl font-bold mb-6">Search Results for &quot;{query}&quot;</h2>
            <TrackList tracks={tracks} />
         </div>
      )}

      {query && !loading && tracks.length === 0 && (
         <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No results found for &quot;{query}&quot;</h3>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      )}
    </div>
  );
}
