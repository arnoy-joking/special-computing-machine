"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track, HistoryItem } from "./types";
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = { HISTORY: 'music_history', FAVORITES: 'music_favorites', VIEW_MODE: 'music_view_mode', UI_STATE: 'music_ui_state' };

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

function updateMediaSession(track: Track | null) {
  if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
    if (!track) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: 'NodeMusic',
      artwork: [
        { src: getThumbnailUrl(track.videoId, 'low'), sizes: '96x96', type: 'image/jpeg' },
        { src: getThumbnailUrl(track.videoId, 'medium'), sizes: '128x128', type: 'image/jpeg' },
        { src: getThumbnailUrl(track.videoId, 'high'), sizes: '256x256', type: 'image/jpeg' },
      ],
    });
  }
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
    dismissed: string[];
    addPlay: (track: Track) => void;
    toggleFavorite: (track: Track) => void;
    addToQueueHistory: (track: Track, source: string) => void;
    dismissTrack: (videoId: string) => void;
}

interface UIState {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  isQueueOpen: boolean;
  setQueueOpen: (isOpen: boolean) => void;
  isVideoPlayerOpen: boolean;
  setVideoPlayerOpen: (isOpen: boolean) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  homeGridSize: number;
  setHomeGridSize: (size: number) => void;
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
    const { loadTrack, currentIndex, nextTrack, prevTrack, togglePlay } = get();
    if (isReady) {
      if (currentIndex !== -1) {
        loadTrack(currentIndex);
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      }
    }
  },
  
  playFromSearch: async (track) => {
    const trackWithHighResThumb = { ...track, thumbnail: getThumbnailUrl(track.videoId, 'high'), artist: track.channel || track.artist };
    
    set({ currentQueue: [trackWithHighResThumb], currentIndex: 0, currentTrack: trackWithHighResThumb });
    get().loadTrack(0);
    useLibraryStore.getState().addToQueueHistory(trackWithHighResThumb, 'search');

    try {
        const res = await fetch(`/api/radio?videoId=${track.videoId}`);
        const data = await res.json();
        if (data.videos && data.videos.length > 0) {
            const newQueue = [
                trackWithHighResThumb, 
                ...data.videos
                    .filter((v: Track) => v.videoId !== track.videoId)
                    .map((v: Track) => ({...v, thumbnail: getThumbnailUrl(v.videoId, 'high'), artist: v.channel || v.artist}))
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
    updateMediaSession(track);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
  },

  togglePlay: () => {
    const { player, isPlaying, currentTrack } = get();
    if (!player || !currentTrack) return;
    if (isPlaying) {
        player.pauseVideo();
        set({ isPlaying: false });
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    } else {
        player.playVideo();
        set({ isPlaying: true });
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    }
  },

  nextTrack: () => {
    const { currentQueue, currentIndex, repeatMode } = get();
    if (currentQueue.length === 0) return;
    
    if (repeatMode === 'one') {
        get().seek(0);
        get().togglePlay();
        setTimeout(() => get().togglePlay(), 100);
        return;
    }

    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentQueue.length) {
        if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            set({ isPlaying: false });
            updateMediaSession(null);
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
      if (prevIndex < 0) prevIndex = currentQueue.length - 1;
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
      if (confirm('Clear entire queue? This will stop playback.')) {
        get().player?.stopVideo();
        set({ currentQueue: [], currentIndex: -1, currentTrack: null, isPlaying: false, progress: 0, duration: 0 });
        updateMediaSession(null);
      }
  },
  
  setQueue: (tracks, startIndex) => {
      const newQueue = tracks.map(t => ({...t, thumbnail: getThumbnailUrl(t.videoId, 'high'), artist: t.channel || t.artist}));
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
      set({ currentQueue: newQueue, currentIndex: 0 });
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
      dismissed: [],
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
                    channel: track.artist || track.channel,
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
                artist: track.artist || track.channel,
                addedAt: Date.now(),
              }, ...favorites];
            }
            return { favorites: newFavorites };
        });
      },
      addToQueueHistory: (track, source) => {
          set(state => ({
              queueHistory: [{...track, thumbnail: getThumbnailUrl(track.videoId, 'high'), addedAt: Date.now(), playedFrom: source, artist: track.artist || track.channel}, ...state.queueHistory].slice(0, 200)
          }))
      },
      dismissTrack: (videoId: string) => {
        set(state => ({
            dismissed: [...state.dismissed, videoId]
        }));
      },
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
      isSidebarCollapsed: false,
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleSidebarCollapse: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      isQueueOpen: false,
      setQueueOpen: (isOpen) => set({ isQueueOpen: isOpen }),
      isVideoPlayerOpen: false,
      setVideoPlayerOpen: (isOpen) => set({ isVideoPlayerOpen: isOpen }),
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      homeGridSize: 6,
      setHomeGridSize: (size) => set({ homeGridSize: size }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        isSidebarCollapsed: state.isSidebarCollapsed,
        homeGridSize: state.homeGridSize,
      }),
    }
  )
);

if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.randomUUID)) {
    window.crypto = window.crypto || {};
    Object.defineProperty(window.crypto, 'randomUUID', {
        value: uuidv4,
    });
}
