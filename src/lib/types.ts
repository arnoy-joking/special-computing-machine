export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  channel: string;
  album: string;
  albumId: string;
  duration: string;
  thumbnail: string;
  thumbnails?: { url: string; width: number, height: number }[];
  addedAt?: number;
  playedFrom?: string;
  score?: number;
  source?: string;
  playCount?: number;
  lastPlayed?: number;
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
  items: Track[];
}

export interface HistoryItem {
  videoId: string;
  title: string;
  channel: string;
  playCount: number;
  lastPlayed: number;
}
