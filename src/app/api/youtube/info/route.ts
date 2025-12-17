import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate YouTube URL
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!ytRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Use yt-dlp to get video info (use local exe)
    const ytdlpPath = process.cwd() + "\\yt-dlp.exe";
    const { stdout } = await execAsync(
      `"${ytdlpPath}" --dump-json --no-download "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );

    const info = JSON.parse(stdout);

    // Parse title to extract artist and song title
    let title = info.title || "";
    let artist = info.uploader || info.channel || "";

    // Common patterns
    const patterns = [
      /^(.+?)\s*[-–—]\s*(.+)$/,
      /^(.+?)\s*\|\s*(.+)$/,
      /^(.+?)「(.+?)」/,
      /^(.+?)\s*:\s*(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        artist = match[1].trim();
        title = match[2].trim();
        break;
      }
    }

    // Clean up title
    title = title
      .replace(/\s*\(Official\s*(Music\s*)?Video\)/gi, "")
      .replace(/\s*\[Official\s*(Music\s*)?Video\]/gi, "")
      .replace(/\s*\(Official\s*Audio\)/gi, "")
      .replace(/\s*\[Official\s*Audio\]/gi, "")
      .replace(/\s*\(Lyric\s*Video\)/gi, "")
      .replace(/\s*\[Lyric\s*Video\]/gi, "")
      .replace(/\s*\(Lyrics\)/gi, "")
      .replace(/\s*\[Lyrics\]/gi, "")
      .replace(/\s*\(Lirik\s*Video\)/gi, "")
      .replace(/\s*MV$/gi, "")
      .replace(/\s*M\/V$/gi, "")
      .trim();

    // Clean up artist
    artist = artist
      .replace(/\s*-\s*Topic$/gi, "")
      .replace(/\s*VEVO$/gi, "")
      .replace(/\s*Official$/gi, "")
      .replace(/\s*Lyrics$/gi, "")
      .trim();

    return NextResponse.json({
      success: true,
      data: {
        videoId: info.id,
        title,
        artist,
        thumbnail: info.thumbnail,
        duration: info.duration || 0,
        originalTitle: info.title,
        channelName: info.channel || info.uploader || "",
        url: url,
      },
    });
  } catch (error) {
    console.error("YouTube info error:", error);
    return NextResponse.json(
      { error: "Gagal mendapatkan info video. Pastikan yt-dlp terinstall dan URL valid." },
      { status: 500 }
    );
  }
}
