"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MusicCarousel from "@/components/music/music-carousel";
import type { MusicCarouselSection, Track } from "@/lib/types";
import { TrackList } from "@/components/music/track-list";

function SearchSkeleton() {
  return (
    <div className="space-y-8">
       <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, j) => (
            <div key={j}>
              <Skeleton className="w-full h-auto aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <Skeleton className="h-3 w-1/2 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MusicCarouselSection[]>([]);
  
  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  const songResults = results.find(r => r.title === 'Songs')?.items as Track[] || [];
  const albumResults = results.find(r => r.title === 'Albums')?.items || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!query && (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Search for Music</h3>
          <p className="text-muted-foreground mt-2">Find your favorite songs, albums, and artists.</p>
        </div>
      )}
      
      {loading && <SearchSkeleton />}

      {results.length > 0 && !loading && (
         <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="all">
              <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Top Result</h2>
                    {songResults.length > 0 && <TrackList tracks={songResults.slice(0, 5)} />}
                </section>
                {albumResults.length > 0 && <MusicCarousel title="Albums" albums={albumResults} />}
              </div>
            </TabsContent>
            <TabsContent value="songs">
                {songResults.length > 0 ? <TrackList tracks={songResults} /> : <p>No songs found.</p>}
            </TabsContent>
             <TabsContent value="albums">
                {albumResults.length > 0 ? <MusicCarousel title="Albums" albums={albumResults} /> : <p>No albums found.</p>}
            </TabsContent>
          </div>
        </Tabs>
      )}

      {query && !loading && results.length === 0 && (
         <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No results found for &quot;{query}&quot;</h3>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      )}
    </div>
  );
}
