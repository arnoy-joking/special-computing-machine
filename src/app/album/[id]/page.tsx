"use client";

import Image from "next/image";
import { Heart, Music, Play, Plus, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePlayerStore } from "@/lib/store";
import { albums, tracks as allTracks } from "@/lib/mock-data";
import type { Track } from "@/lib/types";
import { useLibraryStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.id as string;

  const album = albums.find((a) => a.id === albumId);
  const tracks = allTracks.filter((t) => t.albumId === albumId);

  const setQueue = usePlayerStore((state) => state.setQueue);
  const { likedSongs, likeSong, unlikeSong } = useLibraryStore();

  if (!album) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Album not found.</p>
      </div>
    );
  }

  const handlePlayAlbum = () => {
    setQueue(tracks, 0);
  };

  const handlePlayTrack = (trackIndex: number) => {
    setQueue(tracks, trackIndex);
  };
  
  const handleLike = (track: Track) => {
    if (likedSongs[track.id]) {
      unlikeSong(track.id);
      toast({ title: "Removed from your library" });
    } else {
      likeSong(track);
      toast({ title: "Added to your library" });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <Image
            src={album.artwork}
            alt={`Album art for ${album.title}`}
            width={400}
            height={400}
            className="rounded-lg shadow-lg aspect-square object-cover"
            data-ai-hint={album.artworkHint}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">Album</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mt-2">{album.title}</h1>
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <Music size={16} />
            <span>{album.artist} &bull; {album.year} &bull; {tracks.length} songs</span>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Button size="lg" onClick={handlePlayAlbum} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="mr-2 h-5 w-5" /> Play
            </Button>
            <Button variant="outline" size="icon" aria-label="Add to library">
              <Plus />
            </Button>
            <Button variant="outline" size="icon" aria-label="Share">
              <Share2 />
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

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
                <div className="font-medium">{track.title}</div>
                <div className="text-sm text-muted-foreground">{track.artist}</div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">{track.duration}</TableCell>
              <TableCell className="text-center">
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(track);
                    }}
                  >
                    <Heart className={cn("h-5 w-5 transition-colors", likedSongs[track.id] ? "text-primary fill-current" : "text-muted-foreground group-hover:text-foreground")} />
                  </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}