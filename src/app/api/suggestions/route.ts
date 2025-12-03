import { NextRequest, NextResponse } from "next/server";

const SEARCH_API = 'https://raspy-sound-0966.arnoy799.workers.dev/';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    // The provided API doesn't have a dedicated suggestions endpoint.
    // We can, however, use the search endpoint and extract video titles as suggestions.
    // This isn't perfect but works as a substitute.
    const response = await fetch(`${SEARCH_API}?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    const suggestions: string[] = [];
    if (data.results && Array.isArray(data.results)) {
        data.results.slice(0, 5).forEach((item: any) => {
            if(item.title) {
                suggestions.push(item.title);
            }
        });
    }

    // A real suggestions API would be better, but this will work for now.
    // Let's also add the original query as a suggestion.
    const uniqueSuggestions = [...new Set([query, ...suggestions])];

    return NextResponse.json(uniqueSuggestions);

  } catch (error: any) {
    console.error("Error fetching search suggestions:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch search suggestions", details: error.message },
      { status: 500 }
    );
  }
}
