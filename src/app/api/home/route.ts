import { NextResponse } from "next/server";
import type { Track } from "@/lib/types";

const SEARCH_APIS = [
  'https://raspy-sound-0966.arnoy799.workers.dev/',
  'https://wispy-wave-f6c0.arnoy799.workers.dev/',
];

function getRandomAPI(apiArray: string[]) {
    return apiArray[Math.floor(Math.random() * apiArray.length)];
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            } else {
                throw error;
            }
        }
    }
}

async function fetchCategory(query: string): Promise<Track[]> {
  try {
    const searchAPI = getRandomAPI(SEARCH_APIS);
    const data = await fetchWithRetry(`${searchAPI}?q=${encodeURIComponent(query)}`);

    if (data.results && Array.isArray(data.results)) {
      return data.results.map((item: any) => ({
        id: item.videoId,
        videoId: item.videoId,
        title: item.title,
        artist: item.channel,
        channel: item.channel,
        album: item.title,
        albumId: item.videoId,
        duration: item.duration || "0:00",
        thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`,
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
          items: items.filter(t => t.duration && !t.duration.includes('m') && !t.duration.includes('h')).slice(0, 12),
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
