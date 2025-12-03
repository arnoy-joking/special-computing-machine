"use client";

import { usePlayerStore, useUIStore, useLibraryStore } from "@/lib/store";
import Image from "next/image";
import { Button } from "../ui/button";
import { Heart, SkipBack, SkipForward, Play, Pause, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function PlayerFooter() {
  const { 
    currentTrack,
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack,
    progress,
    duration,
    seek
  } = usePlayerStore();
  
  const { favorites, toggleFavorite } = useLibraryStore();
  const { setVideoPlayerOpen } = useUIStore();
  
  const [isLoved, setIsLoved] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsLoved(favorites.some(fav => fav.videoId === currentTrack.videoId));
    }
  }, [currentTrack, favorites]);

  const handleLoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack) {
      const btn = (e.currentTarget as HTMLButtonElement);
      // Simple animation trigger
      btn.classList.add('heart-animate');
      setTimeout(() => btn.classList.remove('heart-animate'), 300);
      toggleFavorite(currentTrack);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    seek(duration * pct);
  };
  
  const formatTime = (sec: number) => {
      if (isNaN(sec) || sec === 0) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0'+s : s}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer id="player-bar" className="fixed bottom-0 left-0 w-full bg-[#212121] border-t border-[#333] z-40 h-16 sm:h-20">
      <div className="block sm:hidden absolute top-[-2px] left-0 w-full h-[2px] bg-gray-600 cursor-pointer" onClick={handleProgressClick}>
        <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <div className="flex items-center justify-between h-full px-2 sm:px-4">
        {/* Left Side */}
        <div className="flex items-center flex-1 min-w-0 mr-2">
           <button onClick={prevTrack} className="sm:hidden text-gray-300 p-2 mr-1 disabled:opacity-30" disabled={!currentTrack}><SkipBack className="w-6 h-6" /></button>
          <Image 
            src={currentTrack?.thumbnail || 'https://placehold.co/48x48/333/666?text=Music'} 
            alt={currentTrack?.title || 'No song playing'}
            width={48} 
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-gray-800 object-cover flex-shrink-0"
          />
          <div className="ml-3 overflow-hidden flex-1">
            <p className="text-sm sm:text-base font-medium truncate text-white">{currentTrack?.title || 'Ready to play'}</p>
            <p className="text-xs sm:text-sm text-gray-400 truncate">{currentTrack?.channel || 'Select a song'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLoveClick} className={cn("heart-btn hidden sm:block ml-2 text-gray-400 hover:text-primary", isLoved && "loved text-primary")} disabled={!currentTrack}>
              <Heart className="w-6 h-6" />
          </Button>
        </div>

        {/* Center Controls (Desktop) */}
        <div className="hidden sm:flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center space-x-6 mb-1">
             <Button variant="ghost" size="icon" onClick={prevTrack} className="text-gray-400 hover:text-white disabled:opacity-30" disabled={!currentTrack}>
                <SkipBack className="w-6 h-6" />
             </Button>
             <Button onClick={togglePlay} className="bg-white text-black rounded-full p-2 w-12 h-12 hover:scale-105 transition transform" disabled={!currentTrack}>
                {isPlaying ? <Pause className="w-8 h-8"/> : <Play className="w-8 h-8 pl-1"/>}
             </Button>
             <Button variant="ghost" size="icon" onClick={nextTrack} className="text-gray-400 hover:text-white disabled:opacity-30" disabled={!currentTrack}>
                <SkipForward className="w-6 h-6" />
             </Button>
          </div>
          <div className="w-full flex items-center space-x-2 text-xs text-gray-400">
            <span>{formatTime(progress)}</span>
            <div onClick={handleProgressClick} className="relative flex-1 h-1 bg-gray-600 rounded cursor-pointer group">
              <div className="absolute h-full bg-primary rounded" style={{width: `${progressPercent}%`}}></div>
              <div className="absolute h-3 w-3 bg-white rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{left: `${progressPercent}%`}}></div>
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Side & Mobile Controls */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-4 flex-1 sm:flex-none">
            <Button onClick={togglePlay} className="sm:hidden p-2 text-white" disabled={!currentTrack}>
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
            <Button onClick={nextTrack} className="sm:hidden p-2 text-gray-300" disabled={!currentTrack}>
              <SkipForward className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLoveClick} className={cn("heart-btn sm:hidden text-gray-400 hover:text-primary", isLoved && "loved text-primary")} disabled={!currentTrack}>
                <Heart className="w-7 h-7" />
            </Button>

            <Button variant="ghost" onClick={() => setVideoPlayerOpen(true)} className="text-gray-400 hover:text-primary transition" title="Toggle Video" disabled={!currentTrack}>
              <span className="text-xs font-bold border border-current px-1.5 py-0.5 rounded">VIDEO</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { /* Open Queue */ }} className="text-gray-400 hover:text-white" disabled={!currentTrack}>
              <List className="w-6 h-6"/>
            </Button>
        </div>
      </div>
    </footer>
  );
}
