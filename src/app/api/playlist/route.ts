import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const PLAYLIST_PREFIX = "playlist:";

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  songIds: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Check if KV is available
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Fallback in-memory storage for development
declare global {
  // eslint-disable-next-line no-var
  var userPlaylists: Map<string, Playlist[]> | undefined;
}

function getPlaylistsMap(): Map<string, Playlist[]> {
  if (!globalThis.userPlaylists) {
    globalThis.userPlaylists = new Map<string, Playlist[]>();
  }
  return globalThis.userPlaylists;
}

async function getPlaylists(userId: string): Promise<Playlist[]> {
  if (isKVAvailable()) {
    try {
      const playlists = await kv.get<Playlist[]>(`${PLAYLIST_PREFIX}${userId}`);
      return playlists || [];
    } catch (error) {
      console.error("KV get playlists error:", error);
      return [];
    }
  }
  return getPlaylistsMap().get(userId) || [];
}

async function savePlaylists(userId: string, playlists: Playlist[]): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.set(`${PLAYLIST_PREFIX}${userId}`, playlists);
    } catch (error) {
      console.error("KV save playlists error:", error);
    }
  } else {
    getPlaylistsMap().set(userId, playlists);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const playlists = await getPlaylists(userId);

    if (id) {
      const playlist = playlists.find((p) => p.id === id);
      if (!playlist) {
        return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      }
      return NextResponse.json({ playlist });
    }

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error("Playlist API error:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description = "", userId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const id = Date.now().toString();
    const newPlaylist: Playlist = {
      id,
      name,
      description,
      cover: "",
      songIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };

    const playlists = await getPlaylists(userId);
    playlists.unshift(newPlaylist);
    await savePlaylists(userId, playlists);

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch (error) {
    console.error("Create playlist error:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, songIds, action, songId, userId } = body;

    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const playlists = await getPlaylists(userId);
    const index = playlists.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    // Add song to playlist
    if (action === "addSong" && songId) {
      if (!playlists[index].songIds.includes(songId)) {
        playlists[index].songIds.push(songId);
      }
    }
    // Remove song from playlist
    else if (action === "removeSong" && songId) {
      playlists[index].songIds = playlists[index].songIds.filter((s) => s !== songId);
    }
    // Update playlist info
    else {
      if (name) playlists[index].name = name;
      if (description !== undefined) playlists[index].description = description;
      if (songIds) playlists[index].songIds = songIds;
    }

    playlists[index].updatedAt = new Date().toISOString();
    await savePlaylists(userId, playlists);

    return NextResponse.json({ success: true, playlist: playlists[index] });
  } catch (error) {
    console.error("Update playlist error:", error);
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const playlists = await getPlaylists(userId);
    const filtered = playlists.filter((p) => p.id !== id);

    if (filtered.length === playlists.length) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    await savePlaylists(userId, filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete playlist error:", error);
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 });
  }
}
