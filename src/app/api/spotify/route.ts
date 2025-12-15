import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "trending";

  try {
    if (type === "trending") {
      const queries = ["tulus", "noah band", "rizky febian", "mahalini", "tiara andini", "juicy luicy"];
      const allSongs: Array<{
        id: string;
        title: string;
        artist: string;
        cover: string;
        album: string;
        preview_url: string;
        duration_ms: number;
      }> = [];

      for (const q of queries) {
        const response = await fetch(
          `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=5`,
          { 
            next: { revalidate: 3600 },
            headers: { "Accept": "application/json" }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const songs = data.data?.map((track: {
            id: number;
            title: string;
            artist: { name: string };
            album: { title: string; cover_big: string };
            preview: string;
            duration: number;
          }) => ({
            id: String(track.id),
            title: track.title,
            artist: track.artist.name,
            cover: track.album.cover_big,
            album: track.album.title,
            preview_url: track.preview,
            duration_ms: track.duration * 1000,
          })) || [];
          allSongs.push(...songs);
        }
      }

      return NextResponse.json({ songs: allSongs });
    }

    if (type === "artists") {
      const response = await fetch(
        "https://api.deezer.com/search/artist?q=indonesia&limit=15",
        { 
          next: { revalidate: 3600 },
          headers: { "Accept": "application/json" }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`);
      }
      
      const data = await response.json();

      const artists = data.data?.map((artist: {
        id: number;
        name: string;
        picture_big: string;
        nb_fan: number;
      }) => ({
        id: String(artist.id),
        name: artist.name,
        image: artist.picture_big,
        followers: artist.nb_fan,
      })) || [];

      return NextResponse.json({ artists });
    }

    if (type === "albums") {
      const response = await fetch(
        "https://api.deezer.com/search/album?q=indonesia%20pop&limit=15",
        { 
          next: { revalidate: 3600 },
          headers: { "Accept": "application/json" }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`);
      }
      
      const data = await response.json();

      const albums = data.data?.map((album: {
        id: number;
        title: string;
        artist: { name: string };
        cover_big: string;
      }) => ({
        id: String(album.id),
        name: album.title,
        artist: album.artist.name,
        cover: album.cover_big,
        releaseDate: "",
      })) || [];

      return NextResponse.json({ albums });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Deezer API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Deezer" },
      { status: 500 }
    );
  }
}