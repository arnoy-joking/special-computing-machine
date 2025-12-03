"use client";

import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { usePlayerStore, useUIStore } from '@/lib/store';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VideoPlayer() {
    const { setPlayer, setPlayerReady, isPlaying, updateProgress, nextTrack } = usePlayerStore();
    const { isVideoPlayerOpen, setVideoPlayerOpen } = useUIStore();
    const playerRef = useRef<any>(null);

    const onReady = (event: { target: any }) => {
        playerRef.current = event.target;
        setPlayer(event.target);
        setPlayerReady(true);
    };

    const onStateChange = (event: { data: number }) => {
        if (event.data === YT.PlayerState.PLAYING) {
            const interval = setInterval(() => {
                const progress = playerRef.current?.getCurrentTime() || 0;
                const duration = playerRef.current?.getDuration() || 0;
                updateProgress(progress, duration);
            }, 500);
            return () => clearInterval(interval);
        } else if (event.data === YT.PlayerState.ENDED) {
            nextTrack();
        }
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (isPlaying && playerRef.current) {
                const progress = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                updateProgress(progress, duration);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [isPlaying, updateProgress]);

    return (
        <div id="video-wrapper" className={cn(
            "fixed bottom-24 right-4 shadow-2xl rounded-lg overflow-hidden w-64 sm:w-80 aspect-video bg-black border border-[#333] transition-all duration-300",
            isVideoPlayerOpen ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none -z-10"
        )}>
            <YouTube
                opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        playsinline: 1,
                    },
                }}
                onReady={onReady}
                onStateChange={onStateChange}
                className="w-full h-full"
             />
            <Button
                id="hide-video-btn"
                variant="ghost"
                size="icon"
                onClick={() => setVideoPlayerOpen(false)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1 rounded-full h-6 w-6"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    )
}
