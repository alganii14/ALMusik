import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify token");
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "trending";

  try {
    const token = await getSpotifyToken();

    if (type === "trending") {
      // Search for Indonesian artists' top tracks
      const queries = ["tulus", "yovie widianto", "rizky febian", "mahalini", "tiara andini", "juicy luicy"];
      const allSongs: Array<{
        id: string;
        title: string;
        artist: string;
        cover: string;
        album: string;
        preview_url: string | null;
        duration_ms: number;
        uri: string;
      }> = [];

      for (const q of queries) {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=ID&limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
            next: { revalidate: 3600 },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const songs = data.tracks?.items?.map((track: {
            id: string;
            name: string;
            artists: Array<{ name: string }>;
            album: { name: string; images: Array<{ url: string }> };
            preview_url: string | null;
            duration_ms: number;
            uri: string;
          }) => ({
            id: track.id,
            title: track.name,
            artist: track.artists[0]?.name || "Unknown",
            cover: track.album.images[0]?.url || "",
            album: track.album.name,
            preview_url: track.preview_url,
            duration_ms: track.duration_ms,
            uri: track.uri,
          })) || [];
          allSongs.push(...songs);
        }
      }

      // Remove duplicates by id
      const uniqueSongs = allSongs.filter((song, index, self) =>
        index === self.findIndex((s) => s.id === song.id)
      );

      return NextResponse.json({ songs: uniqueSongs });
    }

    if (type === "artists") {
      const response = await fetch(
        "https://api.spotify.com/v1/search?q=genre:indonesian&type=artist&market=ID&limit=15",
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      const artists = data.artists?.items?.map((artist: {
        id: string;
        name: string;
        images: Array<{ url: string }>;
        followers: { total: number };
      }) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || "",
        followers: artist.followers?.total || 0,
      })) || [];

      return NextResponse.json({ artists });
    }

    if (type === "albums") {
      const response = await fetch(
        "https://api.spotify.com/v1/search?q=genre:indonesian%20pop&type=album&market=ID&limit=15",
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      const albums = data.albums?.items?.map((album: {
        id: string;
        name: string;
        artists: Array<{ name: string }>;
        images: Array<{ url: string }>;
        release_date: string;
      }) => ({
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name || "Unknown",
        cover: album.images[0]?.url || "",
        releaseDate: album.release_date,
      })) || [];

      return NextResponse.json({ albums });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Spotify" },
      { status: 500 }
    );
  }
}
