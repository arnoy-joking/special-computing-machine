
"use client";

import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Grid, List, Minus, Plus, Video, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
    const { 
        viewMode, setViewMode, 
        homeGridSize, setHomeGridSize, 
        videoPlayerSize, setVideoPlayerSize,
        geniusApiKey, setGeniusApiKey
    } = useUIStore();

    const [apiKeyInput, setApiKeyInput] = useState(geniusApiKey || "");
    const { toast } = useToast();

    useEffect(() => {
        setApiKeyInput(geniusApiKey || "");
    }, [geniusApiKey]);

    const handleSaveApiKey = () => {
        setGeniusApiKey(apiKeyInput);
        toast({
            title: "API Key Saved",
            description: "Your Genius API key has been updated.",
        });
    };

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
                
                <div className="p-6 rounded-lg border bg-card/50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5"/> Integrations</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Provide API keys for third-party services like Genius for lyrics.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="genius-api-key" className="text-sm font-medium">Genius API Key</label>
                        <div className="flex gap-2">
                            <Input 
                                id="genius-api-key"
                                type="password" 
                                placeholder="Enter your Genius API Access Token" 
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                            />
                            <Button onClick={handleSaveApiKey}>Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
