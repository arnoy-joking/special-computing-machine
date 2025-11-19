import { SearchInput } from "@/components/search/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MusicCarousel from "@/components/music/music-carousel";
import { homeFeed } from "@/lib/mock-data";

export default function SearchPage() {
  // Mock search results
  const allResults = homeFeed[0].items;
  const songResults = homeFeed[1].items;
  const albumResults = homeFeed[2].items;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="all">
            <div className="space-y-8">
              <MusicCarousel title="Top Results" albums={allResults} />
              <MusicCarousel title="Songs" albums={songResults} />
              <MusicCarousel title="Albums" albums={albumResults} />
            </div>
          </TabsContent>
          <TabsContent value="songs">
            <MusicCarousel title="Songs" albums={songResults} />
          </TabsContent>
          <TabsContent value="albums">
            <MusicCarousel title="Albums" albums={albumResults} />
          </TabsContent>
          <TabsContent value="artists">
             <p className="text-muted-foreground text-center py-16">No artists found for your search.</p>
          </TabsContent>
           <TabsContent value="playlists">
             <p className="text-muted-foreground text-center py-16">No playlists found for your search.</p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
