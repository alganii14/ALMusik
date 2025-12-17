import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Fetch lyrics from external APIs
async function fetchLyricsFromAPI(title: string, artist: string): Promise<string> {
  if (!title) return "";
  
  const cleanTitle = title
    .replace(/\(Official.*?\)/gi, "")
    .replace(/\(Video.*?\)/gi, "")
    .replace(/\(Audio.*?\)/gi, "")
    .replace(/\(Lyric.*?\)/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/ft\..*$/i, "")
    .replace(/feat\..*$/i, "")
    .trim();
  
  const cleanArtist = (artist || "")
    .replace(/VEVO$/i, "")
    .replace(/Official$/i, "")
    .replace(/ - Topic$/i, "")
    .trim();

  // Try lrclib.net API (has synced lyrics)
  try {
    if (cleanArtist && cleanTitle) {
      const exactResponse = await fetch(
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (exactResponse.ok) {
        const data = await exactResponse.json();
        if (data.syncedLyrics) return data.syncedLyrics;
        if (data.plainLyrics) return data.plainLyrics;
      }
    }
    
    const searchQuery = cleanArtist ? `${cleanArtist} ${cleanTitle}` : cleanTitle;
    const response = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const withSynced = data.find((item: { syncedLyrics?: string }) => item.syncedLyrics);
        if (withSynced?.syncedLyrics) return withSynced.syncedLyrics;
        const withPlain = data.find((item: { plainLyrics?: string }) => item.plainLyrics);
        if (withPlain?.plainLyrics) return withPlain.plainLyrics;
      }
    }
  } catch (e) {
    console.log("lrclib.net failed:", e);
  }
  
  return "";
}


// Download audio using yt-dlp
async function downloadWithYtDlp(
  url: string,
  outputPath: string
): Promise<boolean> {
  const isWindows = process.platform === "win32";
  
  // Try multiple paths for yt-dlp
  const possiblePaths = isWindows
    ? [path.join(process.cwd(), "yt-dlp.exe"), "yt-dlp.exe"]
    : ["/usr/local/bin/yt-dlp", "/usr/bin/yt-dlp", "yt-dlp"];
  
  let ytdlpPath = "";
  
  for (const p of possiblePaths) {
    try {
      if (p.startsWith("/") || p.includes("\\")) {
        await fs.access(p);
      }
      ytdlpPath = p;
      break;
    } catch {
      continue;
    }
  }
  
  if (!ytdlpPath) {
    // Try system yt-dlp
    ytdlpPath = "yt-dlp";
  }

  try {
    const command = isWindows
      ? `"${ytdlpPath}" -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`
      : `${ytdlpPath} -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;
    
    console.log("Running yt-dlp:", command);
    
    const { stdout, stderr } = await execAsync(command, { timeout: 180000 });
    console.log("yt-dlp stdout:", stdout);
    if (stderr) console.log("yt-dlp stderr:", stderr);
    
    // Check if file was created
    try {
      await fs.access(outputPath);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error("yt-dlp error:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, title, artist, thumbnail, thumbnailFallback, videoId } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const songId = Date.now().toString();
    const musicDir = path.join(process.cwd(), "public", "music");
    
    // Ensure music directory exists
    await fs.mkdir(musicDir, { recursive: true });

    // Download audio using yt-dlp
    console.log("Downloading audio from:", url);
    const audioOutputPath = path.join(musicDir, `${songId}.mp3`);
    const success = await downloadWithYtDlp(url, audioOutputPath);
    
    let audioUrl = "";
    if (success) {
      audioUrl = `/music/${songId}.mp3`;
      console.log("Audio downloaded successfully");
    }

    // If download failed
    if (!audioUrl) {
      return NextResponse.json(
        { error: "Gagal mendownload audio. Pastikan yt-dlp.exe ada di folder project." },
        { status: 500 }
      );
    }

    // Try to fetch lyrics
    let lyrics = "";
    try {
      lyrics = await fetchLyricsFromAPI(title || "", artist || "");
      if (lyrics) console.log("Lyrics found");
    } catch (e) {
      console.log("No lyrics found:", e);
    }

    // Download thumbnail
    let coverPath = "";
    const thumbUrl = thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "");
    if (thumbUrl) {
      try {
        let response = await fetch(thumbUrl);
        if (!response.ok && thumbnailFallback) {
          response = await fetch(thumbnailFallback);
        }
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          coverPath = `/music/${songId}-cover.jpg`;
          await fs.writeFile(path.join(musicDir, `${songId}-cover.jpg`), Buffer.from(buffer));
        }
      } catch (e) {
        console.error("Failed to download thumbnail:", e);
      }
    }

    // Get duration from request body if provided
    const videoDuration = body.duration || 0;

    // Create song entry
    const newSong = {
      id: songId,
      title: title || "Unknown Title",
      artist: artist || "Unknown Artist",
      cover: coverPath || thumbUrl || "/music/default-cover.jpg",
      audioUrl: audioUrl,
      duration: videoDuration,
      lyrics: lyrics,
      createdAt: new Date().toISOString(),
    };

    // Save to songs.json
    const songsPath = path.join(musicDir, "songs.json");
    let songs = [];
    try {
      const data = await fs.readFile(songsPath, "utf-8");
      songs = JSON.parse(data);
    } catch {
      songs = [];
    }

    songs.unshift(newSong);
    await fs.writeFile(songsPath, JSON.stringify(songs, null, 2));

    return NextResponse.json({
      success: true,
      song: newSong,
      message: "Lagu berhasil didownload dan ditambahkan!",
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Gagal mendownload lagu. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
