
"use client";

import { usePlayerStore, useUIStore, useLibraryStore } from "@/lib/store";
import Image from "next/image";
import { Button } from "../ui/button";
import { Heart, SkipBack, SkipForward, Play, Pause, ListMusic, Shuffle, Repeat, Repeat1, Mic2, Laptop2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

export default function PlayerFooter() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const { togglePlay, nextTrack, prevTrack, seek, repeatMode, toggleRepeatMode, isShuffled, toggleShuffle } = usePlayerStore.getState();
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  
  const favorites = useLibraryStore((s) => s.favorites);
  const { toggleFavorite } = useLibraryStore.getState();
  
  const isVideoPlayerOpen = useUIStore((s) => s.isVideoPlayerOpen);
  const setVideoPlayerOpen = useUIStore((s) => s.setVideoPlayerOpen);
  const isQueueOpen = useUIStore((s) => s.isQueueOpen);
  const setQueueOpen = useUIStore((s) => s.setQueueOpen);
  
  const [isLoved, setIsLoved] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      setIsLoved(favorites.some(fav => fav.videoId === currentTrack.videoId));
    } else {
      setIsLoved(false);
    }
  }, [currentTrack, favorites]);

  const handleLoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack) {
      const btn = (e.currentTarget as HTMLButtonElement);
      btn.classList.add('heart-animate');
      setTimeout(() => btn.classList.remove('heart-animate'), 300);
      toggleFavorite(currentTrack);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (!duration) return;
    seek(value[0]);
  };
  
  const formatTime = (sec: number) => {
      if (isNaN(sec) || sec === 0) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0'+s : s}`;
  };
  
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <footer id="player-bar" className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-lg border-t border-border z-40 h-[6.5rem] sm:h-20">
       {/* Mobile View */}
       <div className="sm:hidden h-full flex flex-col px-2 py-2">
            <div className="flex items-center w-full">
                {currentTrack && (
                    <>
                        <Image 
                            src={currentTrack.thumbnail || 'https://placehold.co/64x64/1d1d1f/333?text=Music'} 
                            alt={currentTrack.title}
                            width={40} 
                            height={40}
                            className="w-10 h-10 rounded bg-secondary object-cover flex-shrink-0"
                        />
                        <div className="ml-3 overflow-hidden flex-1">
                            <p className="text-sm font-medium truncate text-foreground">{currentTrack.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleLoveClick} className={cn("heart-btn ml-2 text-muted-foreground hover:text-primary", isLoved && "loved")} disabled={!currentTrack}>
                            <Heart className="w-5 h-5" />
                        </Button>
                        <Button onClick={togglePlay} className="rounded-full p-2 w-10 h-10 ml-1" disabled={!currentTrack}>
                            {isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current pl-0.5"/>}
                        </Button>
                    </>
                )}
            </div>
            <div className="w-full flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                <span>{formatTime(progress)}</span>
                <Slider
                    value={[progress]}
                    max={duration || 1}
                    onValueChange={handleProgressChange}
                    className="flex-1"
                    disabled={!currentTrack}
                />
                <span>{formatTime(duration)}</span>
            </div>
       </div>

      {/* Desktop View */}
      <div className="hidden sm:grid grid-cols-3 h-full px-4">
        {/* Left Side */}
        <div className="flex items-center flex-1 min-w-0">
          {currentTrack && (
            <>
              <Image 
                src={currentTrack.thumbnail || 'https://placehold.co/64x64/1d1d1f/333?text=Music'} 
                alt={currentTrack.title}
                width={56} 
                height={56}
                className="w-14 h-14 rounded bg-secondary object-cover flex-shrink-0"
              />
              <div className="ml-4 overflow-hidden flex-1">
                <p className="text-sm font-medium truncate text-foreground">{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLoveClick} className={cn("heart-btn ml-2 text-muted-foreground hover:text-primary", isLoved && "loved")} disabled={!currentTrack}>
                  <Heart className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center space-x-3 mb-1">
             <Button variant="ghost" size="icon" onClick={toggleShuffle} className={cn("text-muted-foreground hover:text-foreground", isShuffled && "text-primary")} disabled={!currentTrack}>
                <Shuffle className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={prevTrack} className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={!currentTrack}>
                <SkipBack className="w-5 h-5" />
             </Button>
             <Button onClick={togglePlay} className="bg-foreground text-background rounded-full p-2 w-10 h-10 hover:scale-105 transition transform disabled:opacity-50 disabled:scale-100" disabled={!currentTrack}>
                {isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current pl-0.5"/>}
             </Button>
             <Button variant="ghost" size="icon" onClick={nextTrack} className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={!currentTrack}>
                <SkipForward className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={toggleRepeatMode} className={cn("text-muted-foreground hover:text-foreground", repeatMode !== 'off' && "text-primary")} disabled={!currentTrack}>
                <RepeatIcon className="w-5 h-5" />
             </Button>
          </div>
          <div className="w-full max-w-xl flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <Slider
              value={[progress]}
              max={duration || 1}
              onValueChange={handleProgressChange}
              className="flex-1"
              disabled={!currentTrack}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-end space-x-2 flex-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden md:inline-flex" title="Lyrics" disabled={!currentTrack}>
              <Mic2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setQueueOpen(!isQueueOpen)} className={cn("text-muted-foreground hover:text-foreground", isQueueOpen && 'text-primary bg-primary/10')} disabled={!currentTrack} title="Queue">
              <ListMusic className="w-5 h-5"/>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setVideoPlayerOpen(!isVideoPlayerOpen)} className={cn("text-muted-foreground hover:text-foreground", isVideoPlayerOpen && "text-primary")} title="Toggle Video" disabled={!currentTrack}>
              <Laptop2 className="w-5 h-5" />
            </Button>
        </div>
      </div>
    </footer>
  );
}

    