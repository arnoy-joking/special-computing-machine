"use client";

import { SearchInput } from "@/components/search/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import MusicCarousel from "@/components/music/music-carousel";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { MusicCarouselSection } from "@/lib/types";

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
      // setLoading(true);
      // fetch(`/api/search?q=${query}`)
      //   .then(res => res.json())
      //   .then(data => {
      //     setResults(data);
      //     setLoading(false);
      //   })
      //   .catch(err => {
      //     console.error(err);
      //     setLoading(false);
      //   });
    } else {
      setResults([]);
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

      {results.length > 0 && !loading && (
         <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="all">
              <div className="space-y-8">
                {results.map(section => (
                  <MusicCarousel key={section.title} title={section.title} albums={section.items} />
                ))}
              </div>
            </TabsContent>
            {/* Other tabs can be implemented similarly */}
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