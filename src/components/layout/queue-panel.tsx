"use client";

import { usePlayerStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, Music, Shuffle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function QueuePanel() {
    const { isQueueOpen, setQueueOpen } = useUIStore();
    const { currentQueue, currentIndex, loadTrack, clearQueue, shuffleQueue, removeFromQueue } = usePlayerStore();

    const handleRemove = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        removeFromQueue(index);
    };
    
    return (
        <div 
            id="queue-panel" 
            className={cn(
                "h-full bg-black/95 backdrop-blur-lg border-l border-border z-30 overflow-hidden shadow-2xl flex flex-col",
                isQueueOpen ? "w-full md:w-96" : "w-0"
            )}
        >
            <div className="px-4 py-4 flex items-center justify-between border-b border-border bg-black/50 flex-shrink-0">
                <div>
                    <h3 className="font-bold text-xl">Up Next</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={clearQueue} className="text-muted-foreground hover:text-primary transition" title="Clear Queue">
                        Clear
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setQueueOpen(false)} className="text-muted-foreground hover:text-white p-1">
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div id="queue-list" className="p-2">
                    {currentQueue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <Music className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Your queue is empty</p>
                            <p className="text-muted-foreground/60 text-sm mt-1">Play a song to get started</p>
                        </div>
                    ) : (
                        currentQueue.map((track, i) => (
                            <div
                                key={`${track.videoId}-${i}`}
                                onClick={() => loadTrack(i)}
                                className={cn(
                                    "group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all",
                                    i === currentIndex ? "active text-foreground bg-secondary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center justify-center w-6 flex-shrink-0">
                                    {i === currentIndex ? (
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <div className="w-1 h-4 bg-primary mx-0.5 animate-pulse"></div>
                                            <div className="w-1 h-3 bg-primary mx-0.5 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-1 h-4 bg-primary mx-0.5 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-muted-foreground/50">{i + 1}</span>
                                    )}
                                </div>
                                <Image 
                                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
                                    width={48} height={48} 
                                    alt={track.title}
                                    className="w-12 h-12 rounded-md bg-secondary object-cover flex-shrink-0"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/1d1d1f/333?text=Music' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-semibold truncate", i === currentIndex ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground' )}>{track.title}</p>
                                    <p className="text-xs truncate mt-0.5">{track.artist}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleRemove(e, i)}
                                    className="remove-queue-btn opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/20 rounded-full"
                                    title="Remove from queue"
                                >
                                    <X className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

             {currentQueue.length > 0 && (
                <div className="px-4 py-3 border-t border-border bg-black/50 flex-shrink-0">
                    <Button
                        onClick={shuffleQueue}
                        className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2.5 rounded-lg transition"
                    >
                        <Shuffle className="w-5 h-5 mr-2 text-primary" />
                        Shuffle Queue
                    </Button>
                </div>
            )}
        </div>
    );
}
