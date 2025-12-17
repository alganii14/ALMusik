import { NextResponse } from "next/server";

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Clean up title to extract artist and song name
function parseTitle(title: string, channelName: string): { cleanTitle: string; artist: string } {
  let cleanTitle = title;
  let artist = channelName;

  // Common patterns: "Artist - Song Title" or "Song Title | Artist"
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
      cleanTitle = match[2].trim();
      break;
    }
  }

  // Clean up title
  cleanTitle = cleanTitle
    .replace(/\s*\(Official\s*(Music\s*)?Video\)/gi, "")
    .replace(/\s*\[Official\s*(Music\s*)?Video\]/gi, "")
    .replace(/\s*\(Official\s*Audio\)/gi, "")
    .replace(/\s*\[Official\s*Audio\]/gi, "")
    .replace(/\s*\(Lyric\s*Video\)/gi, "")
    .replace(/\s*\[Lyric\s*Video\]/gi, "")
    .replace(/\s*\(Lyrics\)/gi, "")
    .replace(/\s*\[Lyrics\]/gi, "")
    .replace(/\s*\(Lirik\)/gi, "")
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

  return { cleanTitle, artist };
}

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

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Could not extract video ID" }, { status: 400 });
    }

    // Use YouTube oEmbed API (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedResponse = await fetch(oembedUrl);
    
    if (!oembedResponse.ok) {
      return NextResponse.json({ error: "Video not found or unavailable" }, { status: 404 });
    }

    const oembedData = await oembedResponse.json();
    
    // Try to get duration from noembed API
    let duration = 0;
    try {
      const noembedResponse = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (noembedResponse.ok) {
        const noembedData = await noembedResponse.json();
        // noembed doesn't have duration either, try returnyoutubedislike API for basic info
      }
    } catch (e) {
      console.log("noembed failed:", e);
    }

    // Try youtube-dl-api or similar service for duration
    try {
      // Use a public API that provides video duration
      const infoResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (infoResponse.ok) {
        const html = await infoResponse.text();
        // Extract duration from page content
        const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
        if (durationMatch) {
          duration = parseInt(durationMatch[1]);
        }
      }
    } catch (e) {
      console.log("Duration fetch failed:", e);
    }
    
    // Parse title to get artist and clean title
    const { cleanTitle, artist } = parseTitle(oembedData.title, oembedData.author_name);

    // Get high quality thumbnail
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    // Fallback thumbnail if maxres doesn't exist
    const thumbnailFallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return NextResponse.json({
      success: true,
      data: {
        videoId,
        title: cleanTitle,
        artist,
        thumbnail,
        thumbnailFallback,
        duration,
        originalTitle: oembedData.title,
        channelName: oembedData.author_name,
        url: url,
      },
    });
  } catch (error) {
    console.error("YouTube info error:", error);
    return NextResponse.json(
      { error: "Gagal mendapatkan info video. Pastikan URL valid." },
      { status: 500 }
    );
  }
}
