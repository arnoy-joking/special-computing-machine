import { NextRequest, NextResponse } from "next/server";

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


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const searchAPI = getRandomAPI(SEARCH_APIS);
    const data = await fetchWithRetry(`${searchAPI}?q=${encodeURIComponent(query)}`);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error fetching search results:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch search results", details: error.message },
      { status: 500 }
    );
  }
}
