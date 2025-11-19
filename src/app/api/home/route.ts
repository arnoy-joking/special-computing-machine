import { NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";
import { compact } from 'lodash';

// Helper function to extract relevant data from various item types
function parseMusicItem(item: any): any | null {
  if (!item) return null;

  const title = item.title?.text || "Unknown Title";
  const id = item.id || null;
  let artist = "Unknown Artist";
  if (item.artists) {
    artist = item.artists.map((a: any) => a.name).join(", ");
  }
  const thumbnail = item.thumbnails?.[item.thumbnails.length - 1]?.url || "https://picsum.photos/seed/1/400/400";
  const year = item.year || null;

  return {
    id,
    title,
    artist,
    year,
    artwork: thumbnail,
    artworkHint: "album art", // generic hint
  };
}

export async function GET() {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      location: "US",
      lang: "en",
    });

    const feed = await yt.music.getHomeFeed();
    
    const sections = feed.sections.map((section: any) => {
      const sectionRenderer = section.as('MusicCarouselShelf') || section.as('MusicImmersiveCarousel');
      if (!sectionRenderer || !sectionRenderer.contents) {
        return null;
      }
      
      const title = sectionRenderer.header?.title.text || "Untitled Section";
      
      const items = compact(sectionRenderer.contents.map(parseMusicItem));

      if (items.length === 0) {
        return null;
      }
      
      return {
        title,
        items,
      };
    });

    return NextResponse.json(compact(sections));

  } catch (error: any) {
    console.error("Error fetching home feed:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch home feed", details: error.message },
      { status: 500 }
    );
  }
}
