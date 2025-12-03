import { NextRequest, NextResponse } from "next/server";

const SEARCH_API = 'https://raspy-sound-0966.arnoy799.workers.dev/';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    const tracks = data.results.map((track: any) => ({
        id: track.videoId,
        title: track.title,
        artist: track.channel,
        album: track.title, // Placeholder
        albumId: track.videoId, // Placeholder
        duration: track.duration || "0:00",
        artwork: track.thumbnail,
        artworkHint: 'track artwork'
    }));

    const albums = data.results
        .filter((item: any) => item.videoId) // Basic filter for potential albums
        .map((item: any) => ({
            id: item.videoId,
            title: item.title,
            artist: item.channel,
            year: null,
            artwork: item.thumbnail,
            artworkHint: "album art",
    }));

    const results = [
        {
            title: "Songs",
            items: tracks,
        },
        {
            title: "Albums",
            items: albums,
        }
    ];

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Error fetching search results:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch search results", details: error.message },
      { status: 500 }
    );
  }
}
