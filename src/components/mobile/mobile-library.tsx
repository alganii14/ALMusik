"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Music, Heart, Users, Grid, List, SortDesc } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";
import { useAuth } from "@/context/auth-context";

interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  songIds: string[];
  createdAt: string;
}

interface CollaborativePlaylist {
  id: string;
  name: string;
  description: string;
  cover: string;
  ownerId: string;
  ownerName: string;
  collaborators: { userId: string; userName: string }[];
  songs: { id: string }[];
  inviteCode: string;
}

type ViewMode = "list" | "grid";
type FilterType = "all" | "playlists" | "liked";

export default function MobileLibrary() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [collabPlaylists, setCollabPlaylists] = useState<CollaborativePlaylist[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      fetchCollabPlaylists();
    }
  }, [user]);

  async function fetchPlaylists() {
    if (!user) return;
    try {
      const response = await fetch(`/api/playlist?userId=${encodeURIComponent(user.id)}`);
      const data = await response.json();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  }

  async function fetchCollabPlaylists() {
    if (!user) return;
    try {
      const response = await fetch(`/api/collaborative-playlist?userId=${encodeURIComponent(user.id)}`);
      const data = await response.json();
      setCollabPlaylists(data.playlists || []);
    } catch (error) {
      console.error("Failed to fetch collaborative playlists:", error);
    }
  }

  if (!user) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
          <Music size={32} className="text-[#7f7f7f]" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Library Kamu</h2>
        <p className="text-[#b3b3b3] text-sm mb-6">
          Login untuk melihat playlist dan lagu favoritmu
        </p>
        <Link
          href="/login"
          className="inline-block bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white text-2xl font-bold">Library Kamu</h1>
        <button
          onClick={() => router.push("/mobile/create-playlist")}
          className="w-8 h-8 flex items-center justify-center text-white"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all" as const, label: "Semua" },
          { id: "playlists" as const, label: "Playlist" },
          { id: "liked" as const, label: "Disukai" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === item.id
                ? "bg-white text-black"
                : "bg-[#232323] text-white hover:bg-[#2a2a2a]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* View Toggle & Sort */}
      <div className="flex items-center justify-between mb-4">
        <button className="flex items-center gap-2 text-[#b3b3b3] text-sm">
          <SortDesc size={16} />
          <span>Terbaru</span>
        </button>
        <button
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="text-[#b3b3b3]"
        >
          {viewMode === "list" ? <Grid size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Content */}
      <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-2"}>
        {/* Liked Songs */}
        {(filter === "all" || filter === "liked") && (
          <Link
            href="/liked-songs"
            className={viewMode === "grid" 
              ? "flex flex-col"
              : "flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors"
            }
          >
            <div className={`bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded flex items-center justify-center flex-shrink-0 ${
              viewMode === "grid" ? "w-full aspect-square mb-2" : "w-14 h-14"
            }`}>
              <Heart size={viewMode === "grid" ? 40 : 24} className="text-white" fill="white" />
            </div>
            <div className={viewMode === "grid" ? "" : "flex-1 min-w-0"}>
              <p className="text-white text-sm font-medium truncate">Lagu yang Disukai</p>
              {viewMode === "list" && (
                <p className="text-[#b3b3b3] text-xs truncate">
                  Playlist • {favorites.length} lagu
                </p>
              )}
            </div>
          </Link>
        )}

        {/* Collaborative Playlists */}
        {(filter === "all" || filter === "playlists") && collabPlaylists.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/collaborative-playlist/${playlist.id}`}
            className={viewMode === "grid"
              ? "flex flex-col"
              : "flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors"
            }
          >
            <div className={`bg-[#282828] rounded flex items-center justify-center flex-shrink-0 overflow-hidden relative ${
              viewMode === "grid" ? "w-full aspect-square mb-2" : "w-14 h-14"
            }`}>
              {playlist.cover ? (
                <Image src={playlist.cover} alt={playlist.name} fill className="object-cover" unoptimized />
              ) : (
                <Music size={viewMode === "grid" ? 40 : 24} className="text-[#7f7f7f]" />
              )}
              <div className="absolute bottom-1 right-1 bg-[#1DB954] rounded-full p-0.5">
                <Users size={10} className="text-black" />
              </div>
            </div>
            <div className={viewMode === "grid" ? "" : "flex-1 min-w-0"}>
              <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
              {viewMode === "list" && (
                <p className="text-[#b3b3b3] text-xs truncate">
                  Kolaboratif • {playlist.songs.length} lagu
                </p>
              )}
            </div>
          </Link>
        ))}

        {/* Regular Playlists */}
        {(filter === "all" || filter === "playlists") && playlists.map((playlist) => (
          <Link
            key={playlist.id}
            href={`/playlist/${playlist.id}`}
            className={viewMode === "grid"
              ? "flex flex-col"
              : "flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors"
            }
          >
            <div className={`bg-[#282828] rounded flex items-center justify-center flex-shrink-0 overflow-hidden ${
              viewMode === "grid" ? "w-full aspect-square mb-2" : "w-14 h-14"
            }`}>
              {playlist.cover ? (
                <Image src={playlist.cover} alt={playlist.name} fill className="object-cover" unoptimized />
              ) : (
                <Music size={viewMode === "grid" ? 40 : 24} className="text-[#7f7f7f]" />
              )}
            </div>
            <div className={viewMode === "grid" ? "" : "flex-1 min-w-0"}>
              <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
              {viewMode === "list" && (
                <p className="text-[#b3b3b3] text-xs truncate">
                  Playlist • {playlist.songIds.length} lagu
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {playlists.length === 0 && collabPlaylists.length === 0 && filter !== "liked" && (
        <div className="text-center py-8">
          <p className="text-[#b3b3b3] text-sm mb-4">
            Belum ada playlist. Buat playlist pertamamu!
          </p>
          <button
            onClick={() => router.push("/mobile/create-playlist")}
            className="bg-white text-black font-bold px-6 py-2 rounded-full text-sm hover:scale-105 transition-transform"
          >
            Buat Playlist
          </button>
        </div>
      )}
    </div>
  );
}
