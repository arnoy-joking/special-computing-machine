"use client";

import { useEffect, useMemo, useState } from "react";
import { usePlayerStore, useLibraryStore, useUIStore } from "@/lib/store";
import { Track, HistoryItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { feedGenerator } from "@/lib/feed-generator";
import { TrackCard } from "@/components/music/track-card";
import { cn } from "@/lib/utils";

function getThumbnailUrl(videoId: string): string {
  if (!videoId) return 'https://placehold.co/192x192/1d1d1f/333?text=Music';
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function mapHistoryToTracks(history: HistoryItem[]): Track[] {
  return history.map(item => ({
    id: item.videoId,
    videoId: item.videoId,
    title: item.title,
    artist: item.channel,
    channel: item.channel,
    album: item.title,
    albumId: item.videoId,
    duration: '',
    thumbnail: getThumbnailUrl(item.videoId),
  }));
}

function HomeSkeleton() {
  return (
    <div className="space-y-12">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="w-full shrink-0">
                <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const MusicSection = ({ title, items, onPlay, onDismiss, gridSize }: { title: string, items: Track[], onPlay: (track: Track) => void, onDismiss: (videoId: string) => void, gridSize: number }) => {
  if (!items || items.length === 0) return null;
  const gridClasses: Record<number, string> = {
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    7: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7',
    8: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8',
  };

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <div className={cn("grid gap-4", gridClasses[gridSize])}>
        {items.map((track) => (
          <TrackCard 
            key={track.id} 
            track={track} 
            onPlay={() => onPlay(track)} 
            showDismiss
            onDismiss={() => onDismiss(track.videoId)}
          />
        ))}
      </div>
    </section>
  );
};


export default function Home() {
  const [loading, setLoading] = useState(true);

  const playFromSearch = usePlayerStore((s) => s.playFromSearch);
  const { history, favorites, queueHistory, dismissed, dismissTrack } = useLibraryStore();
  const { homeGridSize } = useUIStore();

  const recommendedFeed = useMemo(() => {
    return feedGenerator.generate(history, favorites, queueHistory, dismissed);
  }, [history, favorites, queueHistory, dismissed]);
  
  const listenAgain = useMemo(() => {
    return mapHistoryToTracks(history.slice(0, 18)).filter(t => !dismissed.includes(t.videoId));
  }, [history, dismissed]);
  
  const userFavorites = useMemo(() => {
    return [...favorites].reverse().filter(t => !dismissed.includes(t.videoId));
  }, [favorites, dismissed]);

  useEffect(() => {
    setLoading(false);
  }, []);
  
  const isFirstTime = history.length === 0 && favorites.length === 0;

  const welcomeView = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 mt-20">
        <svg className="w-24 h-24 text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
        <h2 className="text-3xl font-bold mb-3 text-white">Welcome to NodeMusic</h2>
        <p className="text-gray-400 text-lg mb-2">Start your journey by searching for songs</p>
        <p className="text-gray-500 text-sm">Play music to help us build a personalized feed just for you</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Listen Now</h1>
          <p className="text-muted-foreground mt-2">Your personalized dashboard.</p>
        </div>
      </div>

      {loading && <HomeSkeleton />}
      
      {!loading && isFirstTime && welcomeView()}

      {!loading && !isFirstTime && (
        <div className="space-y-12">
          <MusicSection
            title="Listen Again"
            items={listenAgain}
            onPlay={playFromSearch}
            onDismiss={dismissTrack}
            gridSize={homeGridSize}
          />
          <MusicSection
            title="Recommended"
            items={recommendedFeed}
            onPlay={playFromSearch}
            onDismiss={dismissTrack}
            gridSize={homeGridSize}
          />
           <MusicSection
            title="Your Favourites"
            items={userFavorites}
            onPlay={playFromSearch}
            onDismiss={dismissTrack}
            gridSize={homeGridSize}
          />
        </div>
      )}
    </div>
  );
}
