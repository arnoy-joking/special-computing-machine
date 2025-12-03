"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track, HistoryItem } from "./types";
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = { HISTORY: 'music_history', FAVORITES: 'music_favorites', VIEW_MODE: 'music_view_mode' };

// --- API Configuration ---
const RADIO_APIS = [
    'https://long-pond-4887.arnoy799.workers.dev/',
    'https://jolly-hall-c603.arnoy799.workers.dev/',
];

function getRandomAPI(apiArray: string[]) {
    return apiArray[Math.floor(Math.random() * apiArray.length)];
}

function getThumbnailUrl(videoId: string, quality: 'low' | 'medium' | 'high' | 'max' = 'high'): string {
    if (!videoId) return 'https://placehold.co/480x360/1c1c1c/666?text=Music';
    const qualityMap = {
        low: 'default',
        medium: 'mqdefault',
        high: 'hqdefault',
        max: 'sddefault'
    };
    return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality] || 'hqdefault'}.jpg`;
}


// --- Zustand Store Types ---
interface PlayerState {
  player: any;
  isPlayerReady: boolean;
  isPlaying: boolean;
  currentQueue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  progress: number;
  duration: number;
  repeatMode: 'off' | 'one' | 'all';
  isShuffled: boolean;
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
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
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
export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  isPlayerReady: false,
  isPlaying: false,
  currentQueue: [],
  currentIndex: -1,
  currentTrack: null,
  progress: 0,
  duration: 0,
  repeatMode: 'off',
  isShuffled: false,

  setPlayer: (player) => set({ player }),
  setPlayerReady: (isReady) => {
    set({ isPlayerReady: isReady });
    const { loadTrack, currentIndex } = get();
    if (isReady && currentIndex !== -1) {
      loadTrack(currentIndex);
    }
  },
  
  playFromSearch: async (track) => {
    const trackWithHighResThumb = { ...track, thumbnail: getThumbnailUrl(track.videoId, 'high') };
    
    set({ currentQueue: [trackWithHighResThumb], currentIndex: -1, currentTrack: trackWithHighResThumb }); 
    get().loadTrack(0);
    useLibraryStore.getState().addToQueueHistory(trackWithHighResThumb, 'search');

    try {
        const radioAPI = getRandomAPI(RADIO_APIS);
        const res = await fetch(`${radioAPI}?videoId=${track.videoId}`);
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
            const newQueue = [
                trackWithHighResThumb, 
                ...data.videos
                    .filter((v: Track) => v.videoId !== track.videoId)
                    .map((v: Track) => ({...v, thumbnail: getThumbnailUrl(v.videoId, 'high')}))
            ];
            set({ currentQueue: newQueue });
            useUIStore.getState().setQueueOpen(true);
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
    set({ currentIndex: index, currentTrack: track, progress: 0, duration: 0, isPlaying: true });
    player.loadVideoById(track.videoId);
    player.playVideo();
    useLibraryStore.getState().addPlay(track);
  },

  togglePlay: () => {
    const { player, isPlaying, currentTrack } = get();
    if (!player || !currentTrack) return;
    if (isPlaying) {
        player.pauseVideo();
        set({ isPlaying: false });
    } else {
        player.playVideo();
        set({ isPlaying: true });
    }
  },

  nextTrack: () => {
    const { currentQueue, currentIndex, repeatMode } = get();
    if (currentQueue.length === 0) return;
    
    if (repeatMode === 'one') {
        get().seek(0);
        get().togglePlay();
        get().togglePlay();
        return;
    }

    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentQueue.length) {
        if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            // Stop playing if at the end of the queue and repeat is off
            set({ isPlaying: false });
            return;
        }
    }
    get().loadTrack(nextIndex);
  },

  prevTrack: () => {
    const { currentQueue, currentIndex, progress } = get();
    if (progress > 3) {
      get().seek(0);
    } else {
      if (currentQueue.length === 0) return;
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = currentQueue.length - 1; // Loop queue
      get().loadTrack(prevIndex);
    }
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
      const newQueue = tracks.map(t => ({...t, thumbnail: getThumbnailUrl(t.videoId, 'high')}));
      set({ currentQueue: newQueue, currentIndex: -1 });
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
      const { currentQueue, currentIndex } = get();
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
  },

  toggleRepeatMode: () => {
    set(state => {
      const modes = ['off', 'all', 'one'];
      const currentModeIndex = modes.indexOf(state.repeatMode);
      const nextMode = modes[(currentModeIndex + 1) % modes.length] as 'off' | 'one' | 'all';
      return { repeatMode: nextMode };
    });
  },

  toggleShuffle: () => {
    set(state => ({ isShuffled: !state.isShuffled }));
    if(get().isShuffled) {
      get().shuffleQueue();
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
        set(state => {
            const { history } = state;
            const existingIndex = history.findIndex(p => p.videoId === track.videoId);
            let newHistory;

            if (existingIndex > -1) {
                const existing = history[existingIndex];
                existing.playCount++;
                existing.lastPlayed = Date.now();
                newHistory = [existing, ...history.slice(0, existingIndex), ...history.slice(existingIndex + 1)];
            } else {
                newHistory = [{
                    videoId: track.videoId,
                    title: track.title,
                    channel: track.channel,
                    playCount: 1,
                    lastPlayed: Date.now(),
                }, ...history];
            }
            return { history: newHistory.slice(0, 100) };
        });
      },
      toggleFavorite: (track) => {
        set(state => {
            const { favorites } = state;
            const index = favorites.findIndex(f => f.videoId === track.videoId);
            let newFavorites;
            if (index > -1) {
              newFavorites = favorites.filter(f => f.videoId !== track.videoId);
            } else {
              newFavorites = [{
                ...track,
                thumbnail: getThumbnailUrl(track.videoId, 'high'),
                addedAt: Date.now(),
              }, ...favorites];
            }
            return { favorites: newFavorites };
        });
      },
      addToQueueHistory: (track, source) => {
          set(state => ({
              queueHistory: [{...track, thumbnail: getThumbnailUrl(track.videoId, 'high'), addedAt: Date.now(), playedFrom: source}, ...state.queueHistory].slice(0, 200)
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

declare global {
    interface Crypto {
        randomUUID: () => string;
    }
}

if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.randomUUID)) {
    window.crypto = window.crypto || {};
    window.crypto.randomUUID = uuidv4;
}
