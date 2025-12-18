import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MUSIC_DATA_PATH = path.join(process.cwd(), "public", "music", "songs.json");

// CORS headers for mobile app
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
  lyrics: string;
  createdAt: string;
}

async function getSongs(): Promise<Song[]> {
  try {
    const data = await fs.readFile(MUSIC_DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSongs(songs: Song[]): Promise<void> {
  await fs.writeFile(MUSIC_DATA_PATH, JSON.stringify(songs, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "trending";

  try {
    const songs = await getSongs();

    if (type === "trending" || type === "all") {
      return NextResponse.json({ songs });
    }

    if (type === "search") {
      const query = searchParams.get("q")?.toLowerCase() || "";
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
      );
      return NextResponse.json({ songs: filtered });
    }

    return NextResponse.json({ songs }, { headers: corsHeaders });
  } catch (error) {
    console.error("Music API error:", error);
    return NextResponse.json({ error: "Failed to fetch music" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const coverFile = formData.get("cover") as File | null;
    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const duration = parseInt(formData.get("duration") as string) || 0;

    if (!audioFile || !title || !artist) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = Date.now().toString();
    const audioExt = audioFile.name.split(".").pop();
    const audioFileName = `${id}.${audioExt}`;

    // Save audio file
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioPath = path.join(process.cwd(), "public", "music", audioFileName);
    await fs.writeFile(audioPath, audioBuffer);

    // Save cover if provided
    let coverUrl = "/music/default-cover.jpg";
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split(".").pop();
      const coverFileName = `${id}-cover.${coverExt}`;
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const coverPath = path.join(process.cwd(), "public", "music", coverFileName);
      await fs.writeFile(coverPath, coverBuffer);
      coverUrl = `/music/${coverFileName}`;
    }

    const lyrics = (formData.get("lyrics") as string) || "";

    const newSong: Song = {
      id,
      title,
      artist,
      cover: coverUrl,
      audioUrl: `/music/${audioFileName}`,
      duration,
      lyrics,
      createdAt: new Date().toISOString(),
    };

    const songs = await getSongs();
    songs.unshift(newSong);
    await saveSongs(songs);

    return NextResponse.json({ success: true, song: newSong });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, lyrics } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing song ID" }, { status: 400 });
    }

    const songs = await getSongs();
    const songIndex = songs.findIndex((s) => s.id === id);

    if (songIndex === -1) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    songs[songIndex].lyrics = lyrics || "";
    await saveSongs(songs);

    return NextResponse.json({ success: true, song: songs[songIndex] });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing song ID" }, { status: 400 });
    }

    const songs = await getSongs();
    const songIndex = songs.findIndex((s) => s.id === id);

    if (songIndex === -1) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const song = songs[songIndex];

    // Delete audio file
    try {
      const audioPath = path.join(process.cwd(), "public", song.audioUrl);
      await fs.unlink(audioPath);
    } catch {
      // File might not exist
    }

    // Delete cover if not default
    if (song.cover !== "/music/default-cover.jpg") {
      try {
        const coverPath = path.join(process.cwd(), "public", song.cover);
        await fs.unlink(coverPath);
      } catch {
        // File might not exist
      }
    }

    songs.splice(songIndex, 1);
    await saveSongs(songs);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
