"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Music, X, Heart } from "lucide-react";
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

export default function SidebarLibrary() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);

  function handleCreateClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setShowCreateModal(true);
  }

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    } else {
      setPlaylists([]);
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

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim() || !user) return;

    setCreating(true);
    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName, userId: user.id }),
      });

      if (response.ok) {
        setNewPlaylistName("");
        setShowCreateModal(false);
        fetchPlaylists();
      }
    } catch (error) {
      console.error("Failed to create playlist:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#121212] rounded-[8px] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 shadow-sm z-10 shrink-0">
        <button
          className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors duration-200 group"
          aria-label="Collapse Your Library"
        >
          <svg 
            role="img" 
            height="24" 
            width="24" 
            aria-hidden="true" 
            viewBox="0 0 24 24" 
            className="fill-current"
          >
            <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" />
          </svg>
          <span className="font-bold text-base">Your Library</span>
        </button>
        <div className="flex items-center">
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center w-8 h-8 rounded-full text-[#b3b3b3] hover:bg-[#1f1f1f] hover:text-white transition-colors duration-200"
            aria-label="Create playlist"
            title={user ? "Buat playlist baru" : "Login untuk membuat playlist"}
          >
            <Plus size={16} />
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
        {/* Liked Songs - Always show if user is logged in */}
        {user && (
          <Link
            href="/liked-songs"
            className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1f1f1f] transition-colors group my-2"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded flex items-center justify-center flex-shrink-0">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Lagu yang Disukai</p>
              <p className="text-[#b3b3b3] text-xs truncate">
                Playlist • {favorites.length} lagu
              </p>
            </div>
          </Link>
        )}

        {!user ? (
          <section className="bg-[#242424] rounded-[8px] p-5 my-2 flex flex-col items-start gap-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-white font-bold text-[16px] leading-[1.3]">
                Buat playlist pertamamu
              </span>
              <span className="text-white text-sm font-medium">
                Login untuk membuat playlist
              </span>
            </div>
            <button 
              onClick={handleCreateClick}
              className="bg-white text-black text-sm font-bold px-4 py-[6px] rounded-full hover:scale-105 hover:bg-[#f0f0f0] transition-transform duration-100 mt-2"
            >
              Login
            </button>
          </section>
        ) : playlists.length === 0 ? (
          <section className="bg-[#242424] rounded-[8px] p-5 my-2 flex flex-col items-start gap-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-white font-bold text-[16px] leading-[1.3]">
                Buat playlist pertamamu
              </span>
              <span className="text-white text-sm font-medium">
                Mudah kok, kami bantu
              </span>
            </div>
            <button 
              onClick={handleCreateClick}
              className="bg-white text-black text-sm font-bold px-4 py-[6px] rounded-full hover:scale-105 hover:bg-[#f0f0f0] transition-transform duration-100 mt-2"
            >
              Buat playlist
            </button>
          </section>
        ) : (
          <div className="space-y-1 py-2">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1f1f1f] transition-colors group"
              >
                <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {playlist.cover ? (
                    <Image src={playlist.cover} alt={playlist.name} width={48} height={48} className="object-cover" unoptimized />
                  ) : (
                    <Music size={20} className="text-[#7f7f7f]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                  <p className="text-[#b3b3b3] text-xs truncate">
                    Playlist • {playlist.songIds.length} lagu
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal - rendered via portal */}
      {showCreateModal && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <div 
            className="bg-[#282828] rounded-xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Buat Playlist Baru</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#b3b3b3] hover:text-white p-1"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-[#b3b3b3] mb-2">Nama Playlist</label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist Saya"
                className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder:text-[#727272]"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName("");
                }}
                className="px-6 py-3 text-white font-bold hover:scale-105 transition-transform"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim() || creating}
                className="bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 hover:bg-[#1ed760] disabled:opacity-50 disabled:hover:scale-100 transition-transform"
              >
                {creating ? "Membuat..." : "Buat"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
