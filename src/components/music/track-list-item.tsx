
"use client";

import Image from "next/image";
import { Play, Heart, Music } from "lucide-react";
import type { Track } from "@/lib/types";
import { useLibraryStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface TrackListItemProps {
  track: Track;
  onPlay: () => void;
  showFavoriteButton?: boolean;
}

function getThumbnailUrl(videoId: string, quality: 'low' | 'medium' | 'high' | 'max' = 'high'): string {
    if (!videoId) return 'https://placehold.co/96x96/1c1c1c/666?text=No+Image';
    const qualityMap = {
        low: 'default',
        medium: 'mqdefault',
        high: 'hqdefault',
        max: 'sddefault'
    };
    return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality] || 'hqdefault'}.jpg`;
}

export function TrackListItem({ track, onPlay, showFavoriteButton = false }: TrackListItemProps) {
  const thumbnailUrl = getThumbnailUrl(track.videoId, 'medium');
  const { favorites, toggleFavorite } = useLibraryStore();
  const isLoved = favorites.some(f => f.videoId === track.videoId);

  return (
    <div className="flex items-center p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition group" onClick={onPlay}>
      <div className="relative flex-shrink-0 w-16 h-16 mr-4">
        <Image
          src={thumbnailUrl}
          alt={track.title}
          width={64}
          height={64}
          className="rounded-md object-cover w-16 h-16"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/64x64/1d1d1f/333?text=Music' }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-8 h-8 text-white pl-1 fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base truncate text-foreground mb-1">{track.title}</h4>
        <p className="text-sm text-muted-foreground truncate">{track.artist || track.channel}</p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        {showFavoriteButton && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(track);
            }}
            className={cn("flex-shrink-0 text-muted-foreground hover:text-primary", isLoved && "text-primary")}
          >
              <Heart className="w-5 h-5" />
          </Button>
        )}
        {track.duration && !track.duration.includes('m') && !track.duration.includes('h') && (
          <div className="text-sm text-muted-foreground font-medium hidden sm:block w-12 text-right">{track.duration}</div>
        )}
      </div>
    </div>
  );
}
