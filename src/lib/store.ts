"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "./types";

interface PlayerState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
}

interface LibraryState {
  likedSongs: Record<string, Track>;
  history: Track[];
  likeSong: (track: Track) => void;
  unlikeSong: (trackId: string) => void;
  addToHistory: (track: Track) => void;
}

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "nodemusic-ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

const usePlayerStore = create<PlayerState>()((set, get) => ({
  tracks: [],
  currentTrackIndex: -1,
  isPlaying: false,
  setQueue: (tracks, startIndex = 0) => {
    const { addToHistory } = useLibraryStore.getState();
    const trackToPlay = tracks[startIndex];
    if (trackToPlay) {
      addToHistory(trackToPlay);
      set({ tracks, currentTrackIndex: startIndex, isPlaying: true });
    }
  },
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  next: () => {
    const { tracks, currentTrackIndex } = get();
    if (tracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      const { addToHistory } = useLibraryStore.getState();
      addToHistory(tracks[nextIndex]);
      set({ currentTrackIndex: nextIndex, isPlaying: true });
    }
  },
  previous: () => {
    const { tracks, currentTrackIndex } = get();
    if (tracks.length > 0) {
      const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      const { addToHistory } = useLibraryStore.getState();
      addToHistory(tracks[prevIndex]);
      set({ currentTrackIndex: prevIndex, isPlaying: true });
    }
  },
}));

const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedSongs: {},
      history: [],
      likeSong: (track) => {
        const { likedSongs } = get();
        set({ likedSongs: { ...likedSongs, [track.id]: track } });
      },
      unlikeSong: (trackId) => {
        const { likedSongs } = get();
        const newLikedSongs = { ...likedSongs };
        delete newLikedSongs[trackId];
        set({ likedSongs: newLikedSongs });
      },
      addToHistory: (track) => {
        const { history } = get();
        const newHistory = [track, ...history.filter(t => t.id !== track.id)].slice(0, 50);
        set({ history: newHistory });
      },
    }),
    {
      name: "nodemusic-library-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// This is a helper to use both stores.
export const useMusicStore = () => ({
  ...usePlayerStore(),
  ...useLibraryStore(),
});

export { usePlayerStore, useLibraryStore };