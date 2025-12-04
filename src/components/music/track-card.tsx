"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { Track } from "@/lib/types";

function getThumbnailUrl(videoId: string, quality: 'low' | 'medium' | 'high' | 'max' = 'high'): string {
    if (!videoId) return 'https://placehold.co/300x300/1d1d1f/66f0f0?text=Error';
    const qualityMap = {
        low: 'default',
        medium: 'mqdefault',
        high: 'hqdefault',
        max: 'sddefault'
    };
    return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality] || 'hqdefault'}.jpg`;
}

export function TrackCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  const thumbnailUrl = getThumbnailUrl(track.videoId, 'high');
  
  return (
    <div className="group cursor-pointer rounded-xl hover:bg-card transition-all duration-300 w-full" onClick={onPlay}>
      <div className="aspect-square bg-secondary rounded-lg mb-3 relative overflow-hidden shadow-lg">
        <Image 
          src={thumbnailUrl} 
          alt={track.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/192x192/1d1d1f/333?text=Music' }}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
          <div className="bg-primary/80 backdrop-blur-sm rounded-full p-3 shadow-2xl">
            <Play className="w-8 h-8 text-primary-foreground pl-1" />
          </div>
        </div>
      </div>
      <h4 className="font-semibold text-sm truncate text-foreground mb-0.5 px-1">{track.title}</h4>
      <p className="text-xs text-muted-foreground truncate px-1">{track.artist || track.channel}</p>
    </div>
  );
}
