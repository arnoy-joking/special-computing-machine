"use client";

import Image from "next/image";
import { Play, Heart } from "lucide-react";
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
  const thumbnailUrl = track.thumbnail || getThumbnailUrl(track.videoId);
  const { favorites, toggleFavorite } = useLibraryStore();
  const isLoved = favorites.some(f => f.videoId === track.videoId);

  return (
    <div className="flex items-center space-x-4 p-3 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition group" onClick={onPlay}>
      <div className="relative flex-shrink-0">
        <Image
          src={thumbnailUrl}
          alt={track.title}
          width={96}
          height={96}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x96/1c1c1c/666?text=No+Image' }}
        />
        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-lg transition-all">
          <div className="bg-white/90 rounded-full p-2">
            <Play className="w-6 h-6 text-black pl-0.5" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base truncate text-white mb-1">{track.title}</h4>
        <p className="text-sm text-gray-400 truncate">{track.channel}</p>
      </div>
      {showFavoriteButton && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(track);
          }}
          className={cn("flex-shrink-0 text-gray-400 hover:text-primary", isLoved && "text-primary")}
        >
            <Heart className="w-6 h-6" />
        </Button>
      )}
      {track.duration && <div className="text-xs text-gray-500 font-medium hidden sm:block">{track.duration}</div>}
    </div>
  );
}
