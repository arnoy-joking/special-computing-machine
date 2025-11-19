import MusicCarousel from "@/components/music/music-carousel";
import { homeFeed } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Listen Now</h1>
        <p className="text-muted-foreground mt-2">Your daily dose of music, curated just for you.</p>
      </header>
      
      {homeFeed.map((section) => (
        <MusicCarousel key={section.title} title={section.title} albums={section.items} />
      ))}
    </div>
  );
}
