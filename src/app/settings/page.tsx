
"use client";

import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Grid, List, Minus, Plus, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

export default function SettingsPage() {
    const { viewMode, setViewMode, homeGridSize, setHomeGridSize, videoPlayerSize, setVideoPlayerSize } = useUIStore();

    return (
        <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Customize your app experience.</p>

            <div className="space-y-8 max-w-2xl">
                <div className="p-6 rounded-lg border bg-card/50">
                    <h3 className="text-lg font-semibold mb-4">Default View Mode</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Choose how content is displayed in your Library and Search results.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setViewMode('grid')}
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            className={cn("w-full h-24 flex flex-col gap-2 transition-all", viewMode === 'grid' && "border-primary")}
                        >
                            <Grid className="w-8 h-8" />
                            <span>Grid</span>
                        </Button>
                        <Button
                            onClick={() => setViewMode('list')}
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            className={cn("w-full h-24 flex flex-col gap-2 transition-all", viewMode === 'list' && "border-primary")}
                        >
                            <List className="w-8 h-8" />
                            <span>List</span>
                        </Button>
                    </div>
                </div>

                <div className="p-6 rounded-lg border bg-card/50">
                    <h3 className="text-lg font-semibold mb-4">Listen Now Item Size</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Adjust the size of the album art on the Listen Now page.
                    </p>
                    <div className="flex items-center gap-4">
                        <Minus className="w-5 h-5 text-muted-foreground"/>
                        <Slider
                            value={[homeGridSize]}
                            onValueChange={(value) => setHomeGridSize(value[0])}
                            min={3}
                            max={8}
                            step={1}
                        />
                         <Plus className="w-5 h-5 text-muted-foreground"/>
                    </div>
                </div>

                <div className="p-6 rounded-lg border bg-card/50">
                    <h3 className="text-lg font-semibold mb-4">Video Player Size</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Adjust the width of the floating video player.
                    </p>
                    <div className="flex items-center gap-4">
                        <Video className="w-5 h-5 text-muted-foreground"/>
                        <Slider
                            value={[videoPlayerSize]}
                            onValueChange={(value) => setVideoPlayerSize(value[0])}
                            min={256}
                            max={640}
                            step={8}
                        />
                         <Video className="w-8 h-8 text-muted-foreground"/>
                    </div>
                </div>
            </div>
        </div>
    );
}
