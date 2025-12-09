import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const apiKey = request.headers.get("Authorization");

    if (!q) {
        return NextResponse.json({ error: "Search query 'q' is required" }, { status: 400 });
    }
    if (!apiKey) {
        return NextResponse.json({ error: "Authorization header with API key is required" }, { status: 401 });
    }

    try {
        const geniusUrl = `https://api.genius.com/search?q=${encodeURIComponent(q)}`;
        const response = await fetch(geniusUrl, {
            headers: {
                'Authorization': apiKey,
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return NextResponse.json({ 
                error: "Failed to fetch from Genius API", 
                details: errorData 
            }, { status: response.status });
        }
        
        const data = await response.json();
        
        // Find the best match (non-translation, non-remix if possible)
        const bestHit = data.response?.hits?.find((hit: any) => {
            const title = hit.result.title.toLowerCase();
            const artist = hit.result.primary_artist.name.toLowerCase();
            const queryLower = q.toLowerCase();
            
            const isTranslation = title.includes('(traducción') || title.includes('(traduction') || title.includes('(übersetzung') || title.includes('(traduzione)');
            const isRemix = title.includes('remix') || title.includes('version');

            return queryLower.includes(artist.split(' ')[0]) && !isTranslation && !isRemix;
        }) || data.response?.hits?.[0];


        if (bestHit) {
            return NextResponse.json({ url: bestHit.result.url });
        } else {
            return NextResponse.json({ error: "No lyrics found" }, { status: 404 });
        }

    } catch (error: any) {
        return NextResponse.json({ 
            error: "An internal error occurred", 
            details: error.message 
        }, { status: 500 });
    }
}
