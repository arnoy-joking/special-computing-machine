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
                "fixed top-0 right-0 h-full w-full sm:w-96 bg-[#030303] border-l border-[#333] z-30 transform transition-transform duration-300 overflow-hidden shadow-2xl flex flex-col",
                isQueueOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            <div className="px-4 py-4 flex items-center justify-between border-b border-[#212121] bg-[#030303] flex-shrink-0">
                <div>
                    <h3 className="font-bold text-xl">Up Next</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{currentQueue.length} songs in queue</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={clearQueue} className="text-gray-400 hover:text-primary transition" title="Clear Queue">
                        Clear
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setQueueOpen(false)} className="text-gray-400 hover:text-white p-1">
                        <X className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div id="queue-list" className="p-2">
                    {currentQueue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <Music className="w-16 h-16 text-gray-600 mb-4" />
                            <p className="text-gray-400">Your queue is empty</p>
                            <p className="text-gray-500 text-sm mt-1">Play a song to get started</p>
                        </div>
                    ) : (
                        currentQueue.map((track, i) => (
                            <div
                                key={`${track.videoId}-${i}`}
                                onClick={() => loadTrack(i)}
                                className={cn(
                                    "group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all",
                                    i === currentIndex ? "active text-white bg-[#212121]" : "text-gray-300 hover:bg-[#1a1a1a]"
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
                                        <span className="text-xs font-bold text-gray-500">{i + 1}</span>
                                    )}
                                </div>
                                <Image 
                                    src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`}
                                    width={48} height={48} 
                                    alt={track.title}
                                    className="w-12 h-12 rounded-md bg-[#333] object-cover flex-shrink-0"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/48x48/1c1c1c/666?text=Music' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{track.title}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{track.artist}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleRemove(e, i)}
                                    className="remove-queue-btn opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/20 rounded-full"
                                    title="Remove from queue"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-primary" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="px-4 py-3 border-t border-[#212121] bg-[#030303] flex-shrink-0">
                <Button
                    onClick={shuffleQueue}
                    className="w-full bg-[#212121] hover:bg-[#2a2a2a] text-white font-medium py-2.5 rounded-lg transition"
                >
                    <Shuffle className="w-5 h-5 mr-2" />
                    Shuffle Queue
                </Button>
            </div>
        </div>
    );
}
