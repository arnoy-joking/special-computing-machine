import { NextResponse } from "next/server";
import type { Album } from "@/lib/types";

const SEARCH_API = 'https://raspy-sound-0966.arnoy799.workers.dev/';

async function fetchCategory(query: string): Promise<Album[]> {
  try {
    const response = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((item: any) => ({
        id: item.videoId,
        title: item.title,
        artist: item.channel,
        year: null, // API does not provide year
        artwork: item.thumbnail,
        artworkHint: "album art",
      }));
    }
  } catch (error) {
    console.error(`Failed to fetch category "${query}":`, error);
  }
  return [];
}

export async function GET() {
  try {
    const categories = [
      { title: "Trending Now", query: "trending music" },
      { title: "New Releases", query: "new music releases" },
      { title: "Top Charts", query: "top charts music" },
    ];

    const sections = await Promise.all(
      categories.map(async (category) => {
        const items = await fetchCategory(category.query);
        return {
          title: category.title,
          items: items.slice(0, 12), // Limit to 12 items per section
        };
      })
    );

    const filteredSections = sections.filter(section => section.items.length > 0);

    return NextResponse.json(filteredSections);

  } catch (error: any) {
    console.error("Error fetching home feed:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch home feed", details: error.message },
      { status: 500 }
    );
  }
}
