import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    try {
        const scraperUrl = `https://my-genius-scraper.arnoy799.workers.dev/?url=${encodeURIComponent(url)}`;
        const response = await fetch(scraperUrl);

        if (!response.ok) {
             const errorData = await response.text();
            return NextResponse.json({ 
                error: "Failed to scrape lyrics page",
                details: errorData
            }, { status: response.status });
        }

        const lyricsText = await response.text();
        return new Response(lyricsText, {
            headers: { 'Content-Type': 'text/plain' },
        });

    } catch (error: any) {
        return NextResponse.json({ 
            error: "An internal error occurred during scraping",
            details: error.message 
        }, { status: 500 });
    }
}
