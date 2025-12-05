import { NextRequest, NextResponse } from "next/server";

function extractPlaylistData(html: string) {
    const result: any = {
      playlistId: null,
      playlistTitle: null,
      videos: []
    };
  
    try {
      const ytInitialDataMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/s);
      if (ytInitialDataMatch) {
        const data = JSON.parse(ytInitialDataMatch[1]);
        const extracted = extractFromInitialData(data);
        if (extracted.videos.length > 0) {
          return extracted;
        }
      }
  
      const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});<\/script>/s);
      if (playerResponseMatch) {
        const data = JSON.parse(playerResponseMatch[1]);
        const extracted = extractFromPlayerResponse(data);
        if (extracted.videos.length > 0) {
          return extracted;
        }
      }
  
      result.videos = extractVideosFromText(html);
      
      const playlistIdMatch = html.match(/"playlistId":"(RD[^"]+)"/);
      if (playlistIdMatch) result.playlistId = playlistIdMatch[1];
      
      const titleMatch = html.match(/"titleText":\{"simpleText":"([^"]*Mix[^"]*)"\}/);
      if (titleMatch) result.playlistTitle = titleMatch[1];
  
    } catch (error: any) {
      console.error('Extraction error:', error);
    }
  
    return result;
  }
  
  function extractFromInitialData(data: any) {
    const result: any = { playlistId: null, playlistTitle: null, videos: [] };
    
    try {
      const playlist = findPlaylistData(data);
      if (playlist) {
        result.playlistId = playlist.playlistId;
        result.playlistTitle = playlist.title;
        
        if (playlist.contents) {
          playlist.contents.forEach((item: any, index: number) => {
            const video = extractVideoFromItem(item, index);
            if (video) result.videos.push(video);
          });
        }
      }
    } catch (error: any) {
      console.error('Error in extractFromInitialData:', error);
    }
    
    return result;
  }
  
  function findPlaylistData(obj: any, path = ''): any {
    if (!obj || typeof obj !== 'object') return null;
    
    if (obj.playlistId && obj.contents) {
      return obj;
    }
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const result = findPlaylistData(obj[key], path + '.' + key);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  function extractVideoFromItem(item: any, index: number) {
    try {
      const renderer = item.playlistPanelVideoRenderer || item;
      
      if (!renderer.videoId) return null;
      
      return {
        videoId: renderer.videoId,
        title: renderer.title?.simpleText || 
               renderer.title?.runs?.[0]?.text || 
               renderer.title?.accessibility?.accessibilityData?.label,
        duration: renderer.lengthText?.simpleText,
        channel: renderer.shortBylineText?.runs?.[0]?.text,
        channelId: renderer.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId,
        thumbnails: renderer.thumbnail?.thumbnails || [],
        selected: renderer.selected || false,
        index: index,
        playlistSetVideoId: renderer.playlistSetVideoId
      };
    } catch (error: any) {
      console.error('Error extracting video:', error);
      return null;
    }
  }
  
  function extractFromPlayerResponse(data: any) {
    const result: any = { playlistId: null, playlistTitle: null, videos: [] };
    
    try {
      if (data.playlist) {
        result.playlistId = data.playlist.id;
        result.playlistTitle = data.playlist.title;
        
        if (data.playlist.contents) {
          data.playlist.contents.forEach((item: any, index: number) => {
            const video = extractVideoFromPlaylistItem(item, index);
            if (video) result.videos.push(video);
          });
        }
      }
    } catch (error: any) {
      console.error('Error in extractFromPlayerResponse:', error);
    }
    
    return result;
  }
  
  function extractVideoFromPlaylistItem(item: any, index: number) {
    try {
      const renderer = item.playlistPanelVideoRenderer || item;
      
      return {
        videoId: renderer.videoId,
        title: renderer.title?.simpleText,
        duration: renderer.lengthText?.simpleText,
        channel: renderer.shortBylineText?.simpleText,
        index: index
      };
    } catch (error: any) {
      return null;
    }
  }
  
  function extractVideosFromText(html: string) {
    const videos: any[] = [];
    
    try {
      const videoPattern = /"videoId":"([^"]+)".*?"simpleText":"([^"]+?)".*?"simpleText":"(\d+:\d+)".*?"runs":\[\{"text":"([^"]+)"[^\]]*\}\].*?"playlistPanelVideoRenderer"/gs;
      
      let match;
      while ((match = videoPattern.exec(html)) !== null) {
        const [_, videoId, title, duration, channel] = match;
        
        if (videoId && title && !title.includes('Mix -')) {
          videos.push({
            videoId: videoId,
            title: cleanTitle(title),
            duration: duration,
            channel: channel,
            index: videos.length
          });
        }
      }
      
      if (videos.length === 0) {
        const altPattern = /"videoId":"([^"]+)".*?"title":\{"simpleText":"([^"]+?)".*?"lengthText":\{"simpleText":"(\d+:\d+)".*?"shortBylineText":\{"runs":\[\{"text":"([^"]+)"/gs;
        
        while ((match = altPattern.exec(html)) !== null) {
          const [_, videoId, title, duration, channel] = match;
          
          if (videoId && title) {
            videos.push({
              videoId: videoId,
              title: cleanTitle(title),
              duration: duration,
              channel: channel,
              index: videos.length
            });
          }
        }
      }
      
    } catch (error: any) {
      console.error('Error in extractVideosFromText:', error);
    }
    
    return videos;
  }
  
  function cleanTitle(title: string) {
    return title.replace(/\s*\d+\s*minutes?,\s*\d+\s*seconds?/gi, '')
                .replace(/\s*\d+:\d+/g, '')
                .trim();
  }

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
        }
  
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&list=RD${videoId}&start_radio=1`;
        
        const response = await fetch(youtubeUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch YouTube: ${response.status}`);
        }
        
        const html = await response.text();
        const playlistData = extractPlaylistData(html);
        
        return NextResponse.json({
            videoId: videoId,
            ...playlistData
        });
        
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
}
