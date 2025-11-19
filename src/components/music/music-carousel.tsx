import { AlbumCard } from "./album-card";
import type { Album } from "@/lib/types";

interface MusicCarouselProps {
  title: string;
  albums: Album[];
}

export default function MusicCarousel({ title, albums }: MusicCarouselProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}
