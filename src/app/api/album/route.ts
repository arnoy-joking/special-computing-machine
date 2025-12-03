import { NextRequest, NextResponse } from "next/server";

const SEARCH_API = 'https://raspy-sound-0966.arnoy799.workers.dev/';

// The provided API does not have a direct way to get an album by ID.
// As a workaround, we will fetch the song by its ID (videoId) to get its details
// and then search for the artist to get related tracks to simulate an album view.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Album/Track ID is required" }, { status: 400 });
  }

  try {
    // Step 1: Fetch the primary track details using its ID.
    const searchByIdResponse = await fetch(`${SEARCH_API}?q=${encodeURIComponent(id)}`);
    const searchByIdData = await searchByIdResponse.json();
    
    const primaryTrack = searchByIdData.results?.find((item: any) => item.videoId === id);

    if (!primaryTrack) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const artistName = primaryTrack.channel;
    const albumTitle = primaryTrack.title; // Using track title as a pseudo-album title

    // Step 2: Search by the artist to get more tracks for the "album".
    const searchByArtistResponse = await fetch(`${SEARCH_API}?q=${encodeURIComponent(artistName)}`);
    const searchByArtistData = await searchByArtistResponse.json();

    const albumInfo = {
      id: primaryTrack.videoId,
      title: albumTitle,
      artist: artistName,
      year: new Date().getFullYear(), // API doesn't provide year
      artwork: primaryTrack.thumbnail,
      artworkHint: 'album art'
    };
    
    const tracks = searchByArtistData.results.map((track: any) => ({
      id: track.videoId,
      title: track.title,
      artist: track.channel,
      album: albumInfo.title,
      albumId: albumInfo.id,
      duration: track.duration || "0:00",
      artwork: track.thumbnail,
      artworkHint: 'track artwork'
    }));

    // Ensure the primary track is first in the list
    const finalTracks = [
        primaryTrack, 
        ...tracks.filter((t: any) => t.id !== primaryTrack.videoId)
    ].map(t => ({
        id: t.videoId,
        title: t.title,
        artist: t.channel,
        album: albumInfo.title,
        albumId: albumInfo.id,
        duration: t.duration || "0:00",
        artwork: t.thumbnail,
        artworkHint: 'track artwork'
    }));


    return NextResponse.json({ album: albumInfo, tracks: finalTracks.slice(0, 15) });

  } catch (error: any) {
    console.error("Error fetching album data:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch album data", details: error.message },
      { status: 500 }
    );
  }
}
