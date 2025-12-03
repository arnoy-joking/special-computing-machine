"use client";

import { usePlayerStore } from "@/lib/store";
import Image from "next/image";
import { Button } from "../ui/button";
import { Heart, Play, SkipBack, SkipForward, Repeat, Shuffle, Mic2, ListMusic, Laptop2, Volume2, Pause, ArrowUp } from "lucide-react";
import { Slider } from "../ui/slider";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState, useMemo } from "react";
import type { Track } from "@/lib/types";
import Link from "next/link";

export default function PlayerFooter() {
  const { 
    tracks, 
    currentTrackIndex, 
    isPlaying, 
    play, 
    pause, 
    next, 
    previous,
    shuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode
  } = usePlayerStore();
  const { likedSongs, likeSong, unlikeSong } = useLibraryStore();
  const [progress, setProgress] = useState(0);

  const currentTrack = useMemo(() => {
    return tracks[currentTrackIndex] as Track | undefined;
  }, [tracks, currentTrackIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
            const duration = currentTrack ? (parseInt(currentTrack.duration.split(':')[0]) * 60 + parseInt(currentTrack.duration.split(':')[1])) : 180;
            const newProgress = p + (100 / duration);
            if (newProgress >= 100) {
                next();
                return 0;
            }
            return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, next, currentTrack]);

  useEffect(() => {
    setProgress(0);
  }, [currentTrackIndex]);


  if (!currentTrack) {
    return null;
  }
  
  const handleLike = () => {
    if (likedSongs[currentTrack.id]) {
      unlikeSong(currentTrack.id);
      toast({ title: "Removed from your library" });
    } else {
      likeSong(currentTrack);
      toast({ title: "Added to your library" });
    }
  };

  const isLiked = !!likedSongs[currentTrack.id];
  
  const formatTime = (percentage: number) => {
    if (!currentTrack) return "0:00";
    const duration = parseInt(currentTrack.duration.split(':')[0]) * 60 + parseInt(currentTrack.duration.split(':')[1]);
    const seconds = Math.floor((percentage / 100) * duration);
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-black/50 backdrop-blur-lg border-t border-white/10 z-50 flex items-center px-6">
      <div className="w-64 flex items-center gap-4">
        <Link href="/now-playing" className="flex items-center gap-4 group cursor-pointer">
          {currentTrack.artwork && 
            <div className="relative">
              <Image src={currentTrack.artwork} alt={currentTrack.title} width={56} height={56} className="rounded-md" data-ai-hint={currentTrack.artworkHint}/>
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUp className="text-white"/>
              </div>
            </div>
          }
          <div>
            <p className="font-semibold text-white truncate group-hover:underline">{currentTrack.title}</p>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleLike}>
            <Heart className={cn("h-5 w-5", isLiked ? "text-primary fill-current" : "text-muted-foreground")} />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hover:text-white" onClick={toggleShuffle}>
            <Shuffle size={18} className={cn(shuffle ? "text-primary" : "text-muted-foreground")} />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" onClick={previous}>
            <SkipBack size={20} />
          </Button>
          <Button variant="default" className="bg-white text-black rounded-full h-10 w-10 p-0 hover:bg-gray-200" onClick={() => isPlaying ? pause() : play()}>
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" onClick={next}>
            <SkipForward size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="hover:text-white" onClick={toggleRepeatMode}>
            <Repeat size={18} className={cn(repeatMode !== 'off' ? "text-primary" : "text-primary")} />
          </Button>
        </div>
        <div className="w-full max-w-xl flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(progress)}</span>
          <Slider value={[progress]} max={100} step={1} className="w-full" onValueChange={(val) => setProgress(val[0])} />
          <span className="text-xs text-muted-foreground">{currentTrack.duration}</span>
        </div>
      </div>

      <div className="w-64 flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Mic2 size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <ListMusic size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <Laptop2 size={18} />
        </Button>
        <div className="flex items-center gap-2 w-32">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Volume2 size={18} />
            </Button>
            <Slider defaultValue={[50]} max={100} step={1} />
        </div>
      </div>
    </footer>
  );
}
