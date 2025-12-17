import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Clean up title and artist for lyrics search
function cleanForLyricsSearch(title: string, artist: string): { cleanTitle: string; cleanArtist: string } {
  const cleanTitle = title
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\(Video.*?\)/gi, '')
    .replace(/\(Audio.*?\)/gi, '')
    .replace(/\(Lyric.*?\)/gi, '')
    .replace(/\(Music.*?\)/gi, '')
    .replace(/\(Clip.*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/ft\..*$/i, '')
    .replace(/feat\..*$/i, '')
    .replace(/\|.*$/i, '')
    .replace(/-\s*$/, '')
    .trim();
  
  const cleanArtist = artist
    .replace(/VEVO$/i, '')
    .replace(/Official$/i, '')
    .replace(/ - Topic$/i, '')
    .replace(/Channel$/i, '')
    .trim();
  
  return { cleanTitle, cleanArtist };
}

// Fetch lyrics from multiple external APIs
async function fetchLyricsFromAPI(title: string, artist: string): Promise<string> {
  if (!title) return "";
  
  const { cleanTitle, cleanArtist } = cleanForLyricsSearch(title, artist || "");
  console.log(`Searching lyrics for: "${cleanTitle}" by "${cleanArtist}"`);
  
  // Try lrclib.net API first (has synced lyrics!)
  try {
    // Try exact match first
    if (cleanArtist && cleanTitle) {
      const exactResponse = await fetch(
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (exactResponse.ok) {
        const data = await exactResponse.json();
        if (data.syncedLyrics) {
          console.log("Found synced lyrics from lrclib.net (exact match)");
          return data.syncedLyrics;
        }
        if (data.plainLyrics) {
          console.log("Found plain lyrics from lrclib.net (exact match)");
          return data.plainLyrics;
        }
      }
    }
    
    // Try search query
    const searchQuery = cleanArtist ? `${cleanArtist} ${cleanTitle}` : cleanTitle;
    const response = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const withSynced = data.find((item: { syncedLyrics?: string }) => item.syncedLyrics);
        if (withSynced?.syncedLyrics) {
          console.log("Found synced lyrics from lrclib.net (search)");
          return withSynced.syncedLyrics;
        }
        const withPlain = data.find((item: { plainLyrics?: string }) => item.plainLyrics);
        if (withPlain?.plainLyrics) {
          console.log("Found plain lyrics from lrclib.net (search)");
          return withPlain.plainLyrics;
        }
      }
    }
  } catch (e) {
    console.log("lrclib.net failed:", e);
  }
  
  // Try lyrics.ovh API
  try {
    if (cleanArtist) {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.lyrics) {
          console.log("Found lyrics from lyrics.ovh");
          return data.lyrics.trim();
        }
      }
    }
  } catch (e) {
    console.log("lyrics.ovh failed:", e);
  }
  
  // Try with just title
  try {
    const response = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const withSynced = data.find((item: { syncedLyrics?: string }) => item.syncedLyrics);
        if (withSynced?.syncedLyrics) {
          return withSynced.syncedLyrics;
        }
        const withPlain = data.find((item: { plainLyrics?: string }) => item.plainLyrics);
        if (withPlain?.plainLyrics) {
          return withPlain.plainLyrics;
        }
      }
    }
  } catch (e) {
    console.log("lrclib.net (title only) failed:", e);
  }
  
  return "";
}

// GET - Fetch lyrics for a song
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const artist = searchParams.get("artist") || "";
  
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  
  const lyrics = await fetchLyricsFromAPI(title, artist);
  return NextResponse.json({ lyrics });
}

// POST - Update lyrics for a song by ID
export async function POST(request: Request) {
  try {
    const { songId, lyrics, autoFetch } = await request.json();
    
    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
    }
    
    const songsPath = path.join(process.cwd(), "public", "music", "songs.json");
    const data = await fs.readFile(songsPath, "utf-8");
    const songs = JSON.parse(data);
    
    const songIndex = songs.findIndex((s: { id: string }) => s.id === songId);
    if (songIndex === -1) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }
    
    let newLyrics = lyrics;
    
    // Auto fetch lyrics if requested
    if (autoFetch) {
      const song = songs[songIndex];
      newLyrics = await fetchLyricsFromAPI(song.title, song.artist);
      if (!newLyrics) {
        return NextResponse.json({ error: "Tidak dapat menemukan lirik untuk lagu ini" }, { status: 404 });
      }
    }
    
    songs[songIndex].lyrics = newLyrics;
    await fs.writeFile(songsPath, JSON.stringify(songs, null, 2));
    
    return NextResponse.json({ success: true, lyrics: newLyrics });
  } catch (error) {
    console.error("Update lyrics error:", error);
    return NextResponse.json({ error: "Gagal mengupdate lirik" }, { status: 500 });
  }
}
