"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track, HistoryItem } from "./types";
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = { HISTORY: 'music_history', FAVORITES: 'music_favorites', VIEW_MODE: 'music_view_mode' };

// --- Zustand Store Types ---
interface PlayerState {
  player: any; // YouTube player instance
  isPlayerReady: boolean;
  isPlaying: boolean;
  currentQueue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  progress: number;
  duration: number;
  setPlayer: (player: any) => void;
  setPlayerReady: (isReady: boolean) => void;
  playFromSearch: (track: Track) => void;
  loadTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  updateProgress: (progress: number, duration: number) => void;
  clearQueue: () => void;
  setQueue: (tracks: Track[], startIndex: number) => void;
  shuffleQueue: () => void;
  removeFromQueue: (index: number) => void;
}

interface LibraryState {
    history: HistoryItem[];
    favorites: Track[];
    queueHistory: Track[];
    addPlay: (track: Track) => void;
    toggleFavorite: (track: Track) => void;
    addToQueueHistory: (track: Track, source: string) => void;
}

interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isQueueOpen: boolean;
  setQueueOpen: (isOpen: boolean) => void;
  isVideoPlayerOpen: boolean;
  setVideoPlayerOpen: (isOpen: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

// --- Player Store ---
const RADIO_APIS = [
    'https://long-pond-4887.arnoy799.workers.dev/',
    'https://jolly-hall-c603.arnoy799.workers.dev/',
];

function getRandomAPI(apiArray: string[]) {
    return apiArray[Math.floor(Math.random() * apiArray.length)];
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  isPlayerReady: false,
  isPlaying: false,
  currentQueue: [],
  currentIndex: -1,
  currentTrack: null,
  progress: 0,
  duration: 0,

  setPlayer: (player) => set({ player }),
  setPlayerReady: (isReady) => {
    set({ isPlayerReady: isReady });
    const { loadTrack, currentIndex } = get();
    if (isReady && currentIndex !== -1) {
      loadTrack(currentIndex);
    }
  },
  
  playFromSearch: async (track) => {
    set({ currentQueue: [track], currentIndex: -1, currentTrack: track }); // Play immediately
    get().loadTrack(0);
    useLibraryStore.getState().addToQueueHistory(track, 'search');

    try {
        const radioAPI = getRandomAPI(RADIO_APIS);
        const res = await fetch(`${radioAPI}?videoId=${track.videoId}`);
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
            set({ currentQueue: data.videos });
            get().loadTrack(0); // Reload with full queue
            data.videos.forEach((v: Track) => useLibraryStore.getState().addToQueueHistory(v, 'radio'));
        }
    } catch (e) {
        console.warn("Radio fetch failed", e);
    }
  },

  loadTrack: (index) => {
    const { player, currentQueue, isPlayerReady } = get();
    if (!isPlayerReady || index < 0 || index >= currentQueue.length) return;
    
    const track = currentQueue[index];
    set({ currentIndex: index, currentTrack: track, progress: 0, duration: 0 });
    player.loadVideoById(track.videoId);
    useLibraryStore.getState().addPlay(track);
  },

  togglePlay: () => {
    const { player, isPlaying, currentTrack } = get();
    if (!player || !currentTrack) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  },

  nextTrack: () => {
    const { currentQueue, currentIndex } = get();
    if (currentQueue.length === 0) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentQueue.length) nextIndex = 0;
    get().loadTrack(nextIndex);
  },

  prevTrack: () => {
    const { currentQueue, currentIndex } = get();
    if (currentQueue.length === 0) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = currentQueue.length - 1;
    get().loadTrack(prevIndex);
  },

  seek: (time) => {
    const { player } = get();
    if(player) player.seekTo(time, true);
  },

  updateProgress: (progress, duration) => {
    set({ progress, duration });
  },

  clearQueue: () => {
      get().player?.stopVideo();
      set({ currentQueue: [], currentIndex: -1, currentTrack: null, isPlaying: false, progress: 0, duration: 0 });
  },
  
  setQueue: (tracks, startIndex) => {
      set({ currentQueue: tracks, currentIndex: -1 });
      get().loadTrack(startIndex);
  },

  shuffleQueue: () => {
      const { currentQueue, currentIndex } = get();
      if(currentQueue.length <= 1) return;
      const currentTrack = currentQueue[currentIndex];
      const remaining = currentQueue.filter((_, i) => i !== currentIndex);
      
      for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      
      const newQueue = [currentTrack, ...remaining];
      set({ currentQueue: newQueue });
      get().loadTrack(0);
  },
  
  removeFromQueue: (index) => {
      const { currentQueue, currentIndex, nextTrack } = get();
      const newQueue = [...currentQueue];
      newQueue.splice(index, 1);
      
      if(index === currentIndex){
          set({ currentQueue: newQueue });
          if(newQueue.length > 0) {
            get().loadTrack(index % newQueue.length);
          } else {
            get().clearQueue();
          }
      } else if (index < currentIndex) {
          set({ currentQueue: newQueue, currentIndex: currentIndex - 1 });
      } else {
          set({ currentQueue: newQueue });
      }
  }
}));

// --- Library Store ---
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      history: [],
      favorites: [],
      queueHistory: [],
      addPlay: (track) => {
        const { history } = get();
        const existing = history.find(p => p.videoId === track.videoId);
        let newHistory;
        if (existing) {
          existing.playCount++;
          existing.lastPlayed = Date.now();
          newHistory = [...history];
        } else {
          newHistory = [{
            videoId: track.videoId,
            title: track.title,
            channel: track.channel,
            playCount: 1,
            lastPlayed: Date.now(),
          }, ...history];
        }
        set({ history: newHistory.slice(0, 100) });
      },
      toggleFavorite: (track) => {
        const { favorites } = get();
        const index = favorites.findIndex(f => f.videoId === track.videoId);
        let newFavorites;
        if (index > -1) {
          newFavorites = favorites.filter(f => f.videoId !== track.videoId);
        } else {
          newFavorites = [{
            videoId: track.videoId,
            title: track.title,
            channel: track.channel,
            thumbnail: track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`,
          }, ...favorites];
        }
        set({ favorites: newFavorites });
      },
      addToQueueHistory: (track, source) => {
          set(state => ({
              queueHistory: [{...track, addedAt: Date.now(), playedFrom: source}, ...state.queueHistory].slice(0, 200)
          }))
      }
    }),
    {
      name: STORAGE_KEYS.HISTORY,
    }
  )
);

// --- UI Store ---
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      isQueueOpen: false,
      setQueueOpen: (isOpen) => set({ isQueueOpen: isOpen }),
      isVideoPlayerOpen: false,
      setVideoPlayerOpen: (isOpen) => set({ isVideoPlayerOpen: isOpen }),
      currentView: 'home',
      setCurrentView: (view) => set({ currentView: view }),
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: STORAGE_KEYS.VIEW_MODE,
      partialize: (state) => ({ viewMode: state.viewMode, currentView: state.currentView }),
    }
  )
);

// Add this to your store file to handle UUID generation if needed, or install a library
declare global {
    interface crypto {
        randomUUID: () => string;
    }
}

if (typeof window !== 'undefined' && !window.crypto.randomUUID) {
    window.crypto.randomUUID = uuidv4;
}
