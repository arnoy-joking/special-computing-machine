"use client";

import { usePlayerStore } from "@/lib/store";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NowPlayingPage() {
  const router = useRouter();
  const { tracks, currentTrackIndex } = usePlayerStore();
  const currentTrack = tracks[currentTrackIndex];

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <h2 className="text-2xl font-bold">No song playing</h2>
          <p className="text-muted-foreground">Select a song to start listening.</p>
        </div>
      </div>
    );
  }

  const highQualityArtwork = currentTrack.artwork.replace('hqdefault', 'hq720');

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-black">
        <div className="absolute top-8 left-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronDown className="h-8 w-8" />
            </Button>
        </div>
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <div className="w-full aspect-square relative shadow-2xl">
                <Image
                    src={highQualityArtwork}
                    alt={`Artwork for ${currentTrack.title}`}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized
                />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-bold">{currentTrack.title}</h1>
                <p className="text-xl text-muted-foreground mt-2">{currentTrack.artist}</p>
            </div>
            <Button>
                <Video className="mr-2 h-5 w-5" />
                Watch Video
            </Button>
        </div>
    </div>
  );
}
