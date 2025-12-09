"use client";

import { usePlayerStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, Mic2, Loader2, Music } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";

interface LyricsData {
    lyrics: string;
    url: string;
}

export default function LyricsPanel() {
    const { isLyricsOpen, setLyricsOpen, geniusApiKey } = useUIStore();
    const { currentTrack } = usePlayerStore();
    const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedTrack = useMemo(() => {
        return currentTrack;
    }, [currentTrack?.videoId]);


    useEffect(() => {
        if (!isLyricsOpen || !debouncedTrack || !geniusApiKey) {
            setLyricsData(null);
            return;
        }

        const fetchLyrics = async () => {
            setLoading(true);
            setError(null);
            setLyricsData(null);

            try {
                // 1. Search for the song on Genius
                const searchQuery = `${debouncedTrack.title} ${debouncedTrack.artist}`;
                const searchRes = await fetch(`/api/lyrics/search?q=${encodeURIComponent(searchQuery)}`, {
                    headers: { 'Authorization': `Bearer ${geniusApiKey}` }
                });

                if (!searchRes.ok) {
                    throw new Error('Failed to find song on Genius.');
                }
                const searchData = await searchRes.json();
                if (!searchData.url) {
                    throw new Error('No Genius URL found for this song.');
                }
                
                // 2. Scrape the lyrics from the Genius URL
                const scrapeRes = await fetch(`/api/lyrics/scrape?url=${encodeURIComponent(searchData.url)}`);

                if (!scrapeRes.ok) {
                     throw new Error('Failed to load lyrics.');
                }
                const lyricsText = await scrapeRes.text();
                 if (!lyricsText) {
                    throw new Error('Lyrics content is empty.');
                }

                setLyricsData({ lyrics: lyricsText, url: searchData.url });

            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchLyrics();
    }, [isLyricsOpen, debouncedTrack, geniusApiKey]);

    const formattedLyrics = useMemo(() => {
        if (!lyricsData?.lyrics) return '';
        // Replace newlines with <br> for HTML rendering
        return lyricsData.lyrics.replace(/\\n/g, '<br />');
    }, [lyricsData]);
    
    return (
        <>
            {isLyricsOpen && <div onClick={() => setLyricsOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />}
            <div 
                id="lyrics-panel" 
                className={cn(
                    "fixed top-0 right-0 bg-black/95 backdrop-blur-lg border-l border-border z-50 overflow-hidden shadow-2xl flex flex-col w-[85%] md:w-96 transform transition-transform duration-300 ease-in-out h-full",
                    isLyricsOpen ? "translate-x-0" : "translate-x-full",
                    "pb-20"
                )}
            >
                <div className="px-4 py-4 flex items-center justify-between border-b border-border bg-black/50 flex-shrink-0">
                    <h3 className="font-bold text-xl">Lyrics</h3>
                    <Button variant="ghost" size="icon" onClick={() => setLyricsOpen(false)} className="text-muted-foreground hover:text-white p-1">
                        <X className="w-6 h-6" />
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {currentTrack && (
                        <div className="flex items-center gap-4 mb-8">
                            <Image 
                                src={currentTrack.thumbnail || ''}
                                width={64} height={64} 
                                alt={currentTrack.title}
                                className="w-16 h-16 rounded-lg bg-secondary object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="text-lg font-bold truncate">{currentTrack.title}</p>
                                <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Loader2 className="w-12 h-12 animate-spin mb-4" />
                            <p className="text-lg">Fetching lyrics...</p>
                        </div>
                    )}
                    
                    {!loading && error && (
                         <div className="flex flex-col items-center justify-center h-full text-center text-destructive">
                            <X className="w-16 h-16 mb-4" />
                            <p className="text-lg font-semibold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && lyricsData && (
                        <div className="prose prose-invert text-lg whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLyrics }} />
                    )}

                    {!loading && !error && !lyricsData && (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                             {!currentTrack ? (
                                <>
                                    <Music className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Play a song to see its lyrics</p>
                                </>
                             ) : !geniusApiKey ? (
                                 <>
                                    <Mic2 className="w-16 h-16 mb-4" />
                                    <p className="text-lg">No Genius API Key found.</p>
                                    <p className="text-sm">Please add one in Settings to enable lyrics.</p>
                                </>
                             ) : null}
                         </div>
                    )}

                </div>
                 {lyricsData?.url && (
                    <div className="px-4 py-3 border-t border-border bg-black/50 text-center text-xs text-muted-foreground">
                        Lyrics provided by <a href={lyricsData.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Genius</a>
                    </div>
                )}
            </div>
        </>
    );
}
