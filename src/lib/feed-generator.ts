'use client';

import type { Track, HistoryItem } from './types';

function getThumbnailUrl(videoId: string): string {
    if (!videoId) return '';
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export const feedGenerator = {
  generate(history: HistoryItem[], favorites: Track[], queueHistory: Track[]): Track[] {
    const allVideos = new Map<string, Track>();

    // 1. Add played songs from history
    history.forEach(play => {
      allVideos.set(play.videoId, {
        id: play.videoId,
        videoId: play.videoId,
        title: play.title,
        artist: play.channel,
        channel: play.channel,
        album: play.title,
        albumId: play.videoId,
        duration: '',
        thumbnail: getThumbnailUrl(play.videoId),
        playCount: play.playCount,
        lastPlayed: play.lastPlayed,
        source: 'played',
        score: 0,
      });
    });

    // 2. Add or update with favorites (strongest signal)
    favorites.forEach(fav => {
      if (allVideos.has(fav.videoId)) {
        const video = allVideos.get(fav.videoId)!;
        video.source = 'favorite'; // Mark as a favorite
        video.addedAt = fav.addedAt;
      } else {
        allVideos.set(fav.videoId, {
          ...fav,
          id: fav.videoId,
          artist: fav.channel,
          album: fav.title,
          albumId: fav.videoId,
          duration: '',
          thumbnail: getThumbnailUrl(fav.videoId),
          playCount: 0,
          lastPlayed: fav.addedAt,
          source: 'favorite',
          score: 0,
        });
      }
    });

    // 3. Add potential discoveries from radio/queue history
    queueHistory.forEach(queueItem => {
      if (allVideos.has(queueItem.videoId)) return; // Already in library
      if (!queueItem.title || queueItem.title.toLowerCase() === 'unknown') return;

      allVideos.set(queueItem.videoId, {
        ...queueItem,
        id: queueItem.videoId,
        artist: queueItem.channel || 'Unknown Artist',
        album: queueItem.title,
        albumId: queueItem.videoId,
        duration: '',
        thumbnail: getThumbnailUrl(queueItem.videoId),
        playCount: 0,
        lastPlayed: queueItem.addedAt,
        source: queueItem.playedFrom || 'radio',
        score: 0,
      });
    });

    if (allVideos.size === 0) {
      return [];
    }

    const scored = this.scoreVideos(allVideos);
    const diversified = this.diversify(scored);

    return diversified.slice(0, 50);
  },

  scoreVideos(allVideos: Map<string, Track>): Track[] {
    const now = Date.now();
    const maxPlayCount = Math.max(...Array.from(allVideos.values()).map(v => v.playCount || 0), 1);

    const channelEngagement = this.calculateChannelEngagement(allVideos);

    allVideos.forEach((video) => {
      const isFav = video.source === 'favorite';
      const playCount = video.playCount || 0;
      const lastInteraction = video.lastPlayed || video.addedAt || now;
      const daysSince = (now - lastInteraction) / (1000 * 60 * 60 * 24);

      // --- SCORING COMPONENTS ---

      // 1. Recency Score (Exponential Decay): Value recent interactions more.
      // Half-life of 7 days.
      const recencyScore = Math.exp(-daysSince / 7);

      // 2. Engagement Score: Heavily rewards plays and especially favorites.
      // A favorite is worth 3 plays.
      const engagementValue = playCount + (isFav ? 3 : 0);
      const engagementScore = Math.log1p(engagementValue) / Math.log1p(maxPlayCount + 3);

      // 3. Discovery Bonus: Boosts unplayed tracks from radio/search.
      const discoveryBonus = playCount === 0 && (video.source === 'radio' || video.source === 'search') ? 0.5 : 0;
      
      // 4. Channel Affinity: Boosts songs from artists you frequently listen to or favorite.
      const channelScore = (channelEngagement[video.artist] || 0) * 0.4;
      
      // 5. Freshness Penalty: Slightly penalize very old, un-favorited content.
      const freshnessPenalty = (daysSince > 30 && !isFav) ? Math.min((daysSince - 30) / 90, 0.2) : 0;

      // --- FINAL SCORE CALCULATION ---
      const baseScore = 
        (recencyScore * 0.4) +    // 40% weight to recency
        (engagementScore * 0.3) + // 30% weight to engagement
        (channelScore * 0.3);     // 30% weight to artist affinity

      video.score = (baseScore + discoveryBonus) - freshnessPenalty;

      // Add a small random factor to break ties and add variety
      video.score += (Math.random() - 0.5) * 0.05;
    });

    return Array.from(allVideos.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
  },

  calculateChannelEngagement(allVideos: Map<string, Track>): Record<string, number> {
    const engagement: Record<string, number> = {};
    allVideos.forEach(video => {
        if (!engagement[video.artist]) engagement[video.artist] = 0;
        // Each play adds 1, a favorite adds 3
        engagement[video.artist] += (video.playCount || 0) + (video.source === 'favorite' ? 3 : 0);
    });

    const maxEngagement = Math.max(...Object.values(engagement), 1);
    Object.keys(engagement).forEach(channel => {
      engagement[channel] /= maxEngagement; // Normalize to 0-1
    });

    return engagement;
  },

  diversify(videos: Track[]): Track[] {
    if (videos.length === 0) return [];

    const result: Track[] = [];
    const artistCount: Record<string, number> = {};
    let lastArtist: string | null = null;
    const remaining = [...videos];

    while (remaining.length > 0 && result.length < 50) {
      let bestIndex = -1;
      let bestScore = -Infinity;

      // Search for the best candidate in the top N remaining tracks
      for (let i = 0; i < Math.min(remaining.length, 15); i++) {
        const video = remaining[i];
        const artist = video.artist;
        let diversityScore = video.score || 0;

        // Penalize consecutive songs from the same artist
        if (artist === lastArtist) {
            diversityScore -= 0.4;
        }

        // Penalize over-represented artists in the final list
        const artistRepetition = artistCount[artist] || 0;
        diversityScore -= artistRepetition * 0.2;

        if (diversityScore > bestScore) {
          bestScore = diversityScore;
          bestIndex = i;
        }
      }
      
      const selected = bestIndex !== -1 ? remaining.splice(bestIndex, 1)[0] : remaining.shift()!;

      result.push(selected);
      artistCount[selected.artist] = (artistCount[selected.artist] || 0) + 1;
      lastArtist = selected.artist;
    }

    return result;
  },
};
