import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Album ID is required" }, { status: 400 });
  }

  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const albumData = await yt.music.getAlbum(id);
    
    if (!albumData) {
        return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const albumInfo = {
      id: albumData.id,
      title: albumData.title,
      artist: albumData.header?.author?.name || 'Unknown Artist',
      year: albumData.year,
      artwork: albumData.header?.thumbnail?.contents[0].url || "https://picsum.photos/seed/1/400/400",
      artworkHint: 'album art'
    };
    
    const tracks = albumData.contents.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      album: albumInfo.title,
      albumId: albumInfo.id,
      duration: formatDuration(track.duration.seconds),
      artwork: track.thumbnail?.contents[0]?.url || albumInfo.artwork,
      artworkHint: 'track artwork'
    }));

    return NextResponse.json({ album: albumInfo, tracks });

  } catch (error: any) {
    console.error("Error fetching album data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch album data", details: error.message },
      { status: 500 }
    );
  }
}
