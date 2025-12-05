import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data && data[1] && Array.isArray(data[1])) {
      return NextResponse.json(data[1]);
    }
    
    return NextResponse.json([]);

  } catch (error: any) {
    console.error("Error fetching search suggestions:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch search suggestions", details: error.message },
      { status: 500 }
    );
  }
}
