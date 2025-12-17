import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";

const execAsync = promisify(exec);

// Parse VTT/SRT subtitle to LRC format
function parseSubtitleToLRC(content: string, totalDuration: number): string {
  const lines: { time: number; text: string }[] = [];
  
  // Remove VTT header and metadata
  const cleanContent = content
    .replace(/WEBVTT[\s\S]*?\n\n/, '')
    .replace(/Kind:.*\n/g, '')
    .replace(/Language:.*\n/g, '');
  
  // Match timestamp patterns: 00:00:00.000 --> 00:00:00.000 or 00:00.000 --> 00:00.000
  const regex = /(\d{1,2}:)?(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{1,2}:)?(\d{2}):(\d{2})[.,](\d{3})\n([\s\S]*?)(?=\n\n|\n(\d{1,2}:)?(\d{2}):(\d{2})|$)/g;
  
  let match;
  const seenTexts = new Set<string>();
  
  while ((match = regex.exec(cleanContent)) !== null) {
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    const time = hours * 3600 + minutes * 60 + seconds;
    
    // Clean up text - remove HTML tags and duplicate lines
    let text = match[9]
      .replace(/<[^>]*>/g, '')
      .replace(/\n/g, ' ')
      .trim();
    
    // Skip empty or duplicate lines
    if (!text || seenTexts.has(text)) continue;
    seenTexts.add(text);
    
    lines.push({ time, text });
  }
  
  // Convert to LRC format
  if (lines.length === 0) return "";
  
  return lines
    .map(line => {
      const mins = Math.floor(line.time / 60);
      const secs = Math.floor(line.time % 60);
      const ms = Math.floor((line.time % 1) * 100);
      return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}]${line.text}`;
    })
    .join('\n');
}

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
        // Prefer synced lyrics
        const withSynced = data.find((item: { syncedLyrics?: string }) => item.syncedLyrics);
        if (withSynced?.syncedLyrics) {
          console.log("Found synced lyrics from lrclib.net (search)");
          return withSynced.syncedLyrics;
        }
        // Fall back to plain lyrics
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
  
  // Try with just title (sometimes artist name is different)
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
          console.log("Found synced lyrics from lrclib.net (title only)");
          return withSynced.syncedLyrics;
        }
        const withPlain = data.find((item: { plainLyrics?: string }) => item.plainLyrics);
        if (withPlain?.plainLyrics) {
          console.log("Found plain lyrics from lrclib.net (title only)");
          return withPlain.plainLyrics;
        }
      }
    }
  } catch (e) {
    console.log("lrclib.net (title only) failed:", e);
  }
  
  console.log("No lyrics found from any source");
  return "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, artist, thumbnail } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const songId = Date.now().toString();
    const musicDir = path.join(process.cwd(), "public", "music");

    // Ensure music directory exists
    await fs.mkdir(musicDir, { recursive: true });

    const audioPath = path.join(musicDir, `${songId}.mp3`);

    // Download audio using yt-dlp (use local exe)
    const ytdlpPath = path.join(process.cwd(), "yt-dlp.exe");
    const ffmpegPath = path.join(process.cwd(), "ffmpeg.exe");
    console.log("Downloading audio from:", url);
    await execAsync(
      `"${ytdlpPath}" --ffmpeg-location "${ffmpegPath}" -x --audio-format mp3 --audio-quality 0 -o "${audioPath}" "${url}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    // Get video info for duration
    const { stdout } = await execAsync(
      `"${ytdlpPath}" --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    const info = JSON.parse(stdout);

    // Download thumbnail
    let coverPath = "";
    const thumbUrl = thumbnail || info.thumbnail;
    if (thumbUrl) {
      try {
        const response = await fetch(thumbUrl);
        const buffer = await response.arrayBuffer();
        coverPath = `/music/${songId}-cover.jpg`;
        await fs.writeFile(path.join(musicDir, `${songId}-cover.jpg`), Buffer.from(buffer));
      } catch (e) {
        console.error("Failed to download thumbnail:", e);
      }
    }

    // Try to get lyrics from YouTube subtitles
    let lyrics = "";
    try {
      // Download subtitles using yt-dlp
      const subtitlePath = path.join(musicDir, `${songId}-sub`);
      await execAsync(
        `"${ytdlpPath}" --write-auto-sub --sub-lang id,en --skip-download --sub-format vtt -o "${subtitlePath}" "${url}"`,
        { maxBuffer: 10 * 1024 * 1024 }
      ).catch(() => {});

      // Try to read subtitle file (Indonesian first, then English)
      const subFiles = await fs.readdir(musicDir);
      const subFile = subFiles.find(f => f.startsWith(`${songId}-sub`) && (f.endsWith('.vtt') || f.endsWith('.srt')));
      
      if (subFile) {
        const subContent = await fs.readFile(path.join(musicDir, subFile), 'utf-8');
        lyrics = parseSubtitleToLRC(subContent, info.duration || 0);
        // Clean up subtitle file
        await fs.unlink(path.join(musicDir, subFile)).catch(() => {});
      }
    } catch (e) {
      console.log("No subtitles available:", e);
    }

    // If no YouTube subtitles, try external lyrics API
    if (!lyrics) {
      try {
        const songTitle = title || info.title;
        const songArtist = artist || info.channel || info.uploader || "";
        lyrics = await fetchLyricsFromAPI(songTitle, songArtist);
      } catch (e) {
        console.log("No external lyrics found:", e);
      }
    }

    // Add to songs.json
    const songsPath = path.join(musicDir, "songs.json");
    let songs = [];
    try {
      const data = await fs.readFile(songsPath, "utf-8");
      songs = JSON.parse(data);
    } catch {
      songs = [];
    }

    const newSong = {
      id: songId,
      title: title || info.title,
      artist: artist || info.channel || info.uploader || "Unknown",
      cover: coverPath || "/music/default-cover.jpg",
      audioUrl: `/music/${songId}.mp3`,
      duration: info.duration || 0,
      lyrics: lyrics,
      youtubeId: info.id,
    };

    songs.unshift(newSong);
    await fs.writeFile(songsPath, JSON.stringify(songs, null, 2));

    return NextResponse.json({
      success: true,
      song: newSong,
    });
  } catch (error) {
    console.error("YouTube download error:", error);
    return NextResponse.json(
      { error: "Gagal mendownload audio. Pastikan yt-dlp dan ffmpeg terinstall." },
      { status: 500 }
    );
  }
}
