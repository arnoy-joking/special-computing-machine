"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { Track } from "@/lib/types";

export function TrackCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  const thumbnailUrl = track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`;
  
  return (
    <div className="group cursor-pointer p-3 rounded-xl hover:bg-[#1a1a1a] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl" onClick={onPlay}>
      <div className="aspect-square bg-[#1c1c1c] rounded-lg mb-3 relative overflow-hidden">
        <Image 
          src={thumbnailUrl} 
          alt={track.title}
          fill
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/300x300/1c1c1c/666?text=No+Image' }}
        />
        {track.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-medium">{track.duration}</div>
        )}
        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="w-8 h-8 text-black pl-1" />
          </div>
        </div>
      </div>
      <h4 className="font-semibold text-sm truncate text-white mb-1">{track.title}</h4>
      <p className="text-xs text-gray-400 truncate">{track.channel}</p>
    </div>
  );
}
