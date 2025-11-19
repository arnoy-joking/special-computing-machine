"use client";

import { useLibraryStore, usePlayerStore } from "@/lib/store";
import { Heart, History, Play } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Track } from "@/lib/types";

export default function LibraryPage() {
  const { likedSongs: likedSongsMap, unlikeSong } = useLibraryStore();
  const { history } = useLibraryStore();
  const setQueue = usePlayerStore((state) => state.setQueue);

  const likedSongs = Object.values(likedSongsMap);

  const handlePlay = (tracks: Track[], trackIndex: number) => {
    setQueue(tracks, trackIndex);
  };

  const handleUnlike = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    unlikeSong(trackId);
  };
  
  const renderTrackList = (tracks: Track[], isLikedSongs: boolean) => {
    if (tracks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground mb-4">
            {isLikedSongs ? <Heart size={48} /> : <History size={48} />}
          </div>
          <h3 className="text-xl font-semibold">
            {isLikedSongs ? "No liked songs yet" : "No listening history"}
          </h3>
          <p className="text-muted-foreground mt-2">
            {isLikedSongs ? "Songs you like will appear here." : "Songs you play will appear here."}
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Album</TableHead>
            {isLikedSongs && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track, index) => (
            <TableRow key={track.id} className="group cursor-pointer" onClick={() => handlePlay(tracks, index)}>
              <TableCell>
                <Image src={track.artwork} alt={track.title} width={40} height={40} className="rounded" />
              </TableCell>
              <TableCell>
                <div className="font-medium">{track.title}</div>
                <div className="text-sm text-muted-foreground">{track.artist}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">{track.album}</TableCell>
              {isLikedSongs && (
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={(e) => handleUnlike(e, track.id)}>
                    <Heart className="h-5 w-5 text-primary fill-current" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Library</h1>
      <Tabs defaultValue="liked">
        <TabsList>
          <TabsTrigger value="liked">
            <Heart className="mr-2 h-4 w-4" /> Liked Songs
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="liked" className="mt-6">
          {renderTrackList(likedSongs, true)}
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          {renderTrackList(history, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
