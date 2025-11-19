import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false) });
    const suggestionResults = await yt.music.getSearchSuggestions(query);

    const suggestions = suggestionResults.map(s => s.text);

    return NextResponse.json(suggestions);

  } catch (error: any) {
    console.error("Error fetching search suggestions:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch search suggestions", details: error.message },
      { status: 500 }
    );
  }
}
