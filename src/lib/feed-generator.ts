import type { Track, HistoryItem } from './types';
import { useLibraryStore } from './store';

export const feedGenerator = {
  generate(history: HistoryItem[], favorites: Track[], queueHistory: Track[]): Track[] {
    const allVideos = new Map<string, Track>();

    // 1. Add played songs
    history.forEach(play => {
      allVideos.set(play.videoId, {
        ...play,
        id: play.videoId,
        artist: play.channel,
        album: play.title,
        albumId: play.videoId,
        duration: '',
        thumbnail: this.getThumbnailUrl(play.videoId),
        source: 'played',
        score: 0,
      });
    });

    // 2. Add favorites
    favorites.forEach(fav => {
      if (!allVideos.has(fav.videoId)) {
        allVideos.set(fav.videoId, {
          ...fav,
          id: fav.videoId,
          artist: fav.channel,
          album: fav.title,
          albumId: fav.videoId,
          duration: '',
          thumbnail: this.getThumbnailUrl(fav.videoId),
          playCount: 0,
          lastPlayed: fav.addedAt,
          source: 'favorite',
          score: 0,
        });
      } else {
        const video = allVideos.get(fav.videoId);
        if(video) video.source = 'favorite';
      }
    });

    // 3. Add queue history (discovery)
    queueHistory.forEach(queueItem => {
      if (allVideos.has(queueItem.videoId)) return;
      if (!queueItem.title || queueItem.title === 'Unknown' || queueItem.title === 'Unknown Title') return;

      allVideos.set(queueItem.videoId, {
        ...queueItem,
        id: queueItem.videoId,
        artist: queueItem.channel || 'Unknown Artist',
        album: queueItem.title,
        albumId: queueItem.videoId,
        duration: '',
        thumbnail: this.getThumbnailUrl(queueItem.videoId),
        playCount: 0,
        lastPlayed: queueItem.addedAt,
        source: queueItem.playedFrom || 'radio',
        score: 0,
      });
    });

    if (allVideos.size === 0) {
      return [];
    }

    const scored = this.scoreVideos(allVideos, history, favorites);
    const diversified = this.diversify(scored);

    return diversified.slice(0, 50);
  },

  scoreVideos(allVideos: Map<string, Track>, history: HistoryItem[], favorites: Track[]): Track[] {
    const now = Date.now();
    const maxPlayCount = Math.max(...Array.from(allVideos.values()).map(v => v.playCount || 0), 1);
    const channelEngagement = this.calculateChannelEngagement(history, favorites);

    allVideos.forEach((video, videoId) => {
      const isFav = favorites.some(f => f.videoId === videoId);
      const playCount = video.playCount || 0;
      const lastInteraction = video.lastPlayed || video.addedAt || now;
      const daysSince = (now - lastInteraction) / (1000 * 60 * 60 * 24);

      const frequencyScore = playCount > 0 ? (playCount / maxPlayCount) : 0;
      const recencyScore = Math.exp(-daysSince / 7);
      const favoriteBonus = isFav ? 1.5 : 1.0;
      
      let discoveryBonus = 0;
      if (playCount === 0 && (video.source === 'radio' || video.source === 'search')) {
        discoveryBonus = 0.4;
      }

      const channelScore = (channelEngagement[video.channel] || 0) * 0.3;
      
      let freshnessPenalty = 0;
      if (daysSince > 30) {
        freshnessPenalty = Math.min((daysSince - 30) / 60, 0.3);
      }

      const baseScore = (frequencyScore * 0.25) + (recencyScore * 0.25) + discoveryBonus + channelScore;
      video.score = (baseScore * favoriteBonus) - freshnessPenalty;
      video.score += (Math.random() - 0.5) * 0.05;
    });

    return Array.from(allVideos.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
  },

  calculateChannelEngagement(history: HistoryItem[], favorites: Track[]): Record<string, number> {
    const engagement: Record<string, number> = {};

    history.forEach(play => {
      engagement[play.channel] = (engagement[play.channel] || 0) + (play.playCount || 1);
    });

    favorites.forEach(fav => {
      engagement[fav.channel] = (engagement[fav.channel] || 0) + 2;
    });

    const maxEngagement = Math.max(...Object.values(engagement), 1);
    Object.keys(engagement).forEach(channel => {
      engagement[channel] = engagement[channel] / maxEngagement;
    });

    return engagement;
  },

  diversify(videos: Track[]): Track[] {
    if (videos.length === 0) return [];

    const result: Track[] = [];
    const channelCount: Record<string, number> = {};
    const sourceCount: Record<string, number> = { played: 0, radio: 0, search: 0, favorite: 0 };
    let lastChannel: string | null = null;

    const remaining = [...videos];

    while (remaining.length > 0 && result.length < 50) {
      let bestIndex = -1;
      let bestScore = -Infinity;

      for (let i = 0; i < Math.min(remaining.length, 20); i++) {
        const video = remaining[i];
        const channel = video.channel;
        const source = video.source || 'unknown';

        let diversityScore = video.score || 0;

        if (channel === lastChannel) diversityScore -= 0.5;

        const channelRep = channelCount[channel] || 0;
        diversityScore -= channelRep * 0.15;
        
        const sourceRep = sourceCount[source] || 0;
        const targetRatio = source === 'radio' || source === 'search' ? 0.4 : 0.3;
        const sourceRatio = result.length > 0 ? sourceRep / result.length : 0;
        if (sourceRatio < targetRatio) {
          diversityScore += 0.2;
        }

        if (diversityScore > bestScore) {
          bestScore = diversityScore;
          bestIndex = i;
        }
      }
      
      const selected = bestIndex !== -1 ? remaining.splice(bestIndex, 1)[0] : remaining.shift();

      if (selected) {
        result.push(selected);
        channelCount[selected.channel] = (channelCount[selected.channel] || 0) + 1;
        const sourceKey = selected.source || 'unknown';
        if (!sourceCount[sourceKey]) sourceCount[sourceKey] = 0;
        sourceCount[sourceKey]++;
        lastChannel = selected.channel;
      }
    }

    return result;
  },
  
  getThumbnailUrl(videoId: string, quality: 'low' | 'medium' | 'high' | 'max' = 'medium'): string {
      if (!videoId) return '';
      const qualityMap = {
          low: 'default',
          medium: 'mqdefault',
          high: 'hqdefault',
          max: 'sddefault'
      };
      return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality] || 'mqdefault'}.jpg`;
  }
};
