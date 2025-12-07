
"use client";

import { useEffect } from 'react';
import YouTube from 'react-youtube';
import { usePlayerStore, useUIStore } from '@/lib/store';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function VideoPlayer() {
    const { setPlayer, setPlayerReady, isPlaying, updateProgress, nextTrack } = usePlayerStore();
    const { isVideoPlayerOpen, setVideoPlayerOpen } = useUIStore();
    const { toast } = useToast();

    const onReady = (event: { target: any }) => {
        setPlayer(event.target);
        setPlayerReady(true);
    };

    const onError = (event: { data: number }) => {
        const errorCode = event.data;
        // 101 and 150 are errors for "The owner of the requested video does not allow it to be played in embedded players."
        if (errorCode === 101 || errorCode === 150) {
            toast({
                title: "Playback Error",
                description: "Sorry, this song can't be played. Skipping to the next one.",
                variant: 'destructive',
            });
            nextTrack();
        }
    };

    const onStateChange = (event: { data: number }) => {
        const playerState = event.data;
        if (playerState === YT.PlayerState.PLAYING) {
            usePlayerStore.setState({ isPlaying: true });
        } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
            usePlayerStore.setState({ isPlaying: false });
        } else if (playerState === YT.PlayerState.ENDED) {
            usePlayerStore.setState({ isPlaying: false });
            nextTrack();
        }
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            const player = usePlayerStore.getState().player;
            if (usePlayerStore.getState().isPlaying && player && typeof player.getCurrentTime === 'function') {
                const progress = player.getCurrentTime() || 0;
                const duration = player.getDuration() || 0;
                if (duration > 0) {
                    updateProgress(progress, duration);
                }
            }
        }, 500);
        return () => clearInterval(interval);
    }, [isPlaying, updateProgress]);

    return (
        <div id="video-wrapper" className={cn(
            "fixed bottom-24 right-4 shadow-2xl rounded-lg overflow-hidden w-64 sm:w-80 aspect-video bg-black border border-border transition-all duration-300",
            isVideoPlayerOpen ? "opacity-100 pointer-events-auto z-50" : "opacity-0 pointer-events-none -z-10"
        )}>
            <YouTube
                divId="yt-player"
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
                        enablejsapi: 1,
                        origin: typeof window !== 'undefined' ? window.location.origin : '',
                        // @ts-expect-error - unofficial param
                        media_session: false,
                    },
                }}
                onReady={onReady}
                onStateChange={onStateChange}
                onError={onError}
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
