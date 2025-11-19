"use client";

import MusicCarousel from "@/components/music/music-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import type { MusicCarouselSection } from "@/lib/types";
import { useEffect, useState } from "react";

function HomeFeedSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-8 w-1/4 mb-4" />
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
      ))}
    </div>
  );
}


export default function Home() {
  const [homeFeed, setHomeFeed] = useState<MusicCarouselSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeFeed() {
      try {
        setLoading(true);
        const res = await fetch("/api/home");
        const data = await res.json();
        setHomeFeed(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch home feed:", error);
        setHomeFeed([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeFeed();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Listen Now</h1>
        <p className="text-muted-foreground mt-2">
          Your daily dose of music, curated just for you.
        </p>
      </header>

      {loading ? (
        <HomeFeedSkeleton />
      ) : (
        homeFeed.map((section) => (
          <MusicCarousel
            key={section.title}
            title={section.title}
            albums={section.items}
          />
        ))
      )}
    </div>
  );
}
