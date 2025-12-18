import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const COLLAB_PLAYLIST_PREFIX = "collab_playlist:";
const USER_COLLAB_PREFIX = "user_collab:";

export interface CollaborativePlaylist {
  id: string;
  name: string;
  description: string;
  cover: string;
  ownerId: string;
  ownerName: string;
  collaborators: Collaborator[];
  songs: CollabSong[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  userId: string;
  userName: string;
  joinedAt: string;
  role: "owner" | "editor";
}

export interface CollabSong {
  id: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
}

function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

declare global {
  // eslint-disable-next-line no-var
  var collabPlaylists: Map<string, CollaborativePlaylist> | undefined;
  // eslint-disable-next-line no-var
  var userCollabIds: Map<string, string[]> | undefined;
}

function getCollabMap(): Map<string, CollaborativePlaylist> {
  if (!globalThis.collabPlaylists) {
    globalThis.collabPlaylists = new Map();
  }
  return globalThis.collabPlaylists;
}

function getUserCollabMap(): Map<string, string[]> {
  if (!globalThis.userCollabIds) {
    globalThis.userCollabIds = new Map();
  }
  return globalThis.userCollabIds;
}


function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function getPlaylist(id: string): Promise<CollaborativePlaylist | null> {
  if (isKVAvailable()) {
    try {
      return await kv.get<CollaborativePlaylist>(`${COLLAB_PLAYLIST_PREFIX}${id}`);
    } catch (error) {
      console.error("KV get error:", error);
      return null;
    }
  }
  return getCollabMap().get(id) || null;
}

async function savePlaylist(playlist: CollaborativePlaylist): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.set(`${COLLAB_PLAYLIST_PREFIX}${playlist.id}`, playlist);
    } catch (error) {
      console.error("KV save error:", error);
    }
  } else {
    getCollabMap().set(playlist.id, playlist);
  }
}

async function deletePlaylist(id: string): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.del(`${COLLAB_PLAYLIST_PREFIX}${id}`);
    } catch (error) {
      console.error("KV delete error:", error);
    }
  } else {
    getCollabMap().delete(id);
  }
}

async function getUserCollabIds(userId: string): Promise<string[]> {
  if (isKVAvailable()) {
    try {
      return (await kv.get<string[]>(`${USER_COLLAB_PREFIX}${userId}`)) || [];
    } catch (error) {
      console.error("KV get user collab error:", error);
      return [];
    }
  }
  return getUserCollabMap().get(userId) || [];
}

async function saveUserCollabIds(userId: string, ids: string[]): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.set(`${USER_COLLAB_PREFIX}${userId}`, ids);
    } catch (error) {
      console.error("KV save user collab error:", error);
    }
  } else {
    getUserCollabMap().set(userId, ids);
  }
}

async function addUserToCollab(userId: string, playlistId: string): Promise<void> {
  const ids = await getUserCollabIds(userId);
  if (!ids.includes(playlistId)) {
    ids.push(playlistId);
    await saveUserCollabIds(userId, ids);
  }
}

async function removeUserFromCollab(userId: string, playlistId: string): Promise<void> {
  const ids = await getUserCollabIds(userId);
  const filtered = ids.filter((id) => id !== playlistId);
  await saveUserCollabIds(userId, filtered);
}


// GET - Fetch collaborative playlists for a user or by invite code
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const playlistId = searchParams.get("id");
  const inviteCode = searchParams.get("inviteCode");

  try {
    // Get playlist by invite code
    if (inviteCode) {
      if (isKVAvailable()) {
        // For KV, we need to scan - simplified approach
        return NextResponse.json({ error: "Invite code lookup requires playlist ID" }, { status: 400 });
      }
      const allPlaylists = Array.from(getCollabMap().values());
      const playlist = allPlaylists.find((p) => p.inviteCode === inviteCode);
      if (!playlist) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
      }
      return NextResponse.json({ playlist });
    }

    // Get specific playlist
    if (playlistId) {
      const playlist = await getPlaylist(playlistId);
      if (!playlist) {
        return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      }
      return NextResponse.json({ playlist });
    }

    // Get all collaborative playlists for user
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const collabIds = await getUserCollabIds(userId);
    const playlists: CollaborativePlaylist[] = [];

    for (const id of collabIds) {
      const playlist = await getPlaylist(id);
      if (playlist) {
        playlists.push(playlist);
      }
    }

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error("Collaborative playlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}

// POST - Create new collaborative playlist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description = "", userId, userName } = body;

    if (!name || !userId || !userName) {
      return NextResponse.json({ error: "Name, userId, and userName are required" }, { status: 400 });
    }

    const id = `collab_${Date.now()}`;
    const inviteCode = generateInviteCode();

    const newPlaylist: CollaborativePlaylist = {
      id,
      name,
      description,
      cover: "",
      ownerId: userId,
      ownerName: userName,
      collaborators: [
        {
          userId,
          userName,
          joinedAt: new Date().toISOString(),
          role: "owner",
        },
      ],
      songs: [],
      inviteCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePlaylist(newPlaylist);
    await addUserToCollab(userId, id);

    return NextResponse.json({ success: true, playlist: newPlaylist });
  } catch (error) {
    console.error("Create collaborative playlist error:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}


// PUT - Update collaborative playlist (add/remove songs, join, leave)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, userId, userName, songId, name, description, inviteCode } = body;

    // Join by invite code
    if (action === "join" && inviteCode) {
      let playlist: CollaborativePlaylist | null = null;
      
      if (isKVAvailable()) {
        // Need to provide playlist ID for KV
        if (id) {
          playlist = await getPlaylist(id);
          if (playlist?.inviteCode !== inviteCode) {
            return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
          }
        }
      } else {
        const allPlaylists = Array.from(getCollabMap().values());
        playlist = allPlaylists.find((p) => p.inviteCode === inviteCode) || null;
      }

      if (!playlist) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
      }

      // Check if already a collaborator
      if (playlist.collaborators.some((c) => c.userId === userId)) {
        return NextResponse.json({ success: true, playlist, message: "Already a collaborator" });
      }

      playlist.collaborators.push({
        userId,
        userName,
        joinedAt: new Date().toISOString(),
        role: "editor",
      });
      playlist.updatedAt = new Date().toISOString();

      await savePlaylist(playlist);
      await addUserToCollab(userId, playlist.id);

      return NextResponse.json({ success: true, playlist });
    }

    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
    }

    const playlist = await getPlaylist(id);
    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    // Check if user is a collaborator
    const isCollaborator = playlist.collaborators.some((c) => c.userId === userId);
    if (!isCollaborator && action !== "join") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    switch (action) {
      case "addSong":
        if (!songId) {
          return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
        }
        if (!playlist.songs.some((s) => s.id === songId)) {
          playlist.songs.push({
            id: songId,
            addedBy: userId,
            addedByName: userName,
            addedAt: new Date().toISOString(),
          });
        }
        break;

      case "removeSong":
        if (!songId) {
          return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
        }
        playlist.songs = playlist.songs.filter((s) => s.id !== songId);
        break;

      case "leave":
        if (playlist.ownerId === userId) {
          return NextResponse.json({ error: "Owner cannot leave. Delete the playlist instead." }, { status: 400 });
        }
        playlist.collaborators = playlist.collaborators.filter((c) => c.userId !== userId);
        await removeUserFromCollab(userId, id);
        break;

      case "updateInfo":
        if (playlist.ownerId !== userId) {
          return NextResponse.json({ error: "Only owner can update playlist info" }, { status: 403 });
        }
        if (name) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        break;

      case "regenerateCode":
        if (playlist.ownerId !== userId) {
          return NextResponse.json({ error: "Only owner can regenerate invite code" }, { status: 403 });
        }
        playlist.inviteCode = generateInviteCode();
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    playlist.updatedAt = new Date().toISOString();
    await savePlaylist(playlist);

    return NextResponse.json({ success: true, playlist });
  } catch (error) {
    console.error("Update collaborative playlist error:", error);
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}

// DELETE - Delete collaborative playlist (owner only)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json({ error: "Playlist ID and User ID are required" }, { status: 400 });
    }

    const playlist = await getPlaylist(id);
    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (playlist.ownerId !== userId) {
      return NextResponse.json({ error: "Only owner can delete the playlist" }, { status: 403 });
    }

    // Remove from all collaborators' lists
    for (const collab of playlist.collaborators) {
      await removeUserFromCollab(collab.userId, id);
    }

    await deletePlaylist(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete collaborative playlist error:", error);
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 });
  }
}
