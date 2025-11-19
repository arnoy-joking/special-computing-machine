"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Track } from "./types";

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  tracks: Track[];
  originalTracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  toggleRepeatMode: () => void;
  setVolume: (volume: number) => void;
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
    }
  )
);

const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      tracks: [],
      originalTracks: [],
      currentTrackIndex: -1,
      isPlaying: false,
      shuffle: false,
      repeatMode: 'off',
      volume: 0.5,
      setQueue: (tracks, startIndex = 0) => {
        const { addToHistory } = useLibraryStore.getState();
        const trackToPlay = tracks[startIndex];
        if (trackToPlay) {
          addToHistory(trackToPlay);
          set({ tracks, originalTracks: tracks, currentTrackIndex: startIndex, isPlaying: true });
        }
      },
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      next: () => {
        const { tracks, currentTrackIndex, repeatMode, shuffle } = get();
        if (tracks.length > 0) {
          if (repeatMode === 'one') {
            // Replay the current track
            const currentTrack = tracks[currentTrackIndex];
            const { addToHistory } = useLibraryStore.getState();
            addToHistory(currentTrack);
            set({ isPlaying: true }); // Should restart the track, handled in component
            return;
          }
          
          let nextIndex = (currentTrackIndex + 1);

          if (nextIndex >= tracks.length) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              set({ isPlaying: false });
              return;
            }
          }
          
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
      toggleShuffle: () => {
        const { shuffle, originalTracks, tracks, currentTrackIndex } = get();
        const newShuffleState = !shuffle;
        if (newShuffleState) {
          const currentTrack = tracks[currentTrackIndex];
          const restOfTracks = originalTracks.filter(t => t.id !== currentTrack.id);
          const shuffledRest = restOfTracks.sort(() => Math.random() - 0.5);
          const newQueue = [currentTrack, ...shuffledRest];
          set({ tracks: newQueue, currentTrackIndex: 0, shuffle: newShuffleState });
        } else {
          const currentTrack = tracks[currentTrackIndex];
          const newIndex = originalTracks.findIndex(t => t.id === currentTrack.id);
          set({ tracks: [...originalTracks], currentTrackIndex: newIndex > -1 ? newIndex : 0, shuffle: newShuffleState });
        }
      },
      toggleRepeatMode: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
        set({ repeatMode: nextMode });
      },
      setVolume: (volume: number) => set({ volume }),
    }),
    {
      name: "nodemusic-player-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ volume: state.volume, repeatMode: state.repeatMode, shuffle: state.shuffle }),
    }
  )
);


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

export { usePlayerStore, useLibraryStore };
