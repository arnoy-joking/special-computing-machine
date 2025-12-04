"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/lib/store";
import { Track } from "@/lib/types";
import { MusicCarouselSection } from "@/components/music/music-carousel";
import { Skeleton } from "@/components/ui/skeleton";

interface Section {
  title: string;
  items: Track[];
}

function FeedSkeleton() {
  return (
    <div className="space-y-12">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex space-x-4 overflow-hidden">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="w-48 shrink-0">
                <Skeleton className="w-48 h-48 rounded-lg mb-3" />
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const playFromSearch = usePlayerStore((s) => s.playFromSearch);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/home')
      .then(res => res.json())
      .then(data => {
        setSections(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch home feed", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Listen Now</h1>
        <p className="text-muted-foreground mt-2">Your daily dose of music, curated just for you.</p>
      </div>

      {loading && <FeedSkeleton />}
      
      {!loading && sections.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 mt-20">
            <svg className="w-24 h-24 text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
            <h2 className="text-3xl font-bold mb-3 text-white">Welcome to Music</h2>
            <p className="text-gray-400 text-lg mb-2">Start your journey by searching for songs</p>
            <p className="text-gray-500 text-sm">Play music to help us build a personalized feed just for you</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-12">
          {sections.map((section, index) => (
            <MusicCarouselSection
              key={index}
              title={section.title}
              items={section.items}
              onPlay={playFromSearch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
