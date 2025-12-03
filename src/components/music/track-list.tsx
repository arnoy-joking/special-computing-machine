"use client";

import Image from "next/image";
import { Heart, Play } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePlayerStore, useLibraryStore } from "@/lib/store";
import type { Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";

export function TrackList({ tracks }: { tracks: Track[] }) {
  const setQueue = usePlayerStore((state) => state.setQueue);
  const { likedSongs, likeSong, unlikeSong } = useLibraryStore();

  const handlePlayTrack = (trackIndex: number) => {
    setQueue(tracks, trackIndex);
  };

  const handleLike = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (likedSongs[track.id]) {
      unlikeSong(track.id);
      toast({ title: "Removed from your library" });
    } else {
      likeSong(track);
      toast({ title: "Added to your library" });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="text-right">Duration</TableHead>
          <TableHead className="w-12 text-center">Like</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tracks.map((track, index) => (
          <TableRow key={track.id} className="group cursor-pointer" onClick={() => handlePlayTrack(index)}>
            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
            <TableCell>
              <div className="flex items-center gap-4">
                <Image src={track.artwork} alt={track.title} width={40} height={40} className="rounded" />
                <div>
                  <div className="font-medium">{track.title}</div>
                  <div className="text-sm text-muted-foreground">{track.artist}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">{track.duration}</TableCell>
            <TableCell className="text-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleLike(e, track)}
              >
                <Heart className={cn("h-5 w-5 transition-colors", likedSongs[track.id] ? "text-primary fill-current" : "text-muted-foreground group-hover:text-foreground")} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
