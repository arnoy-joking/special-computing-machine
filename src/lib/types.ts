export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  duration: string; // e.g., "3:45"
  artwork: string;
  artworkHint: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  artwork: string;
  artworkHint: string;
}

export interface MusicCarouselSection {
  title: string;
  items: Album[];
}
