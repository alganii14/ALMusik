"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Music, Users } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function MobileCreatePlaylistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [playlistName, setPlaylistName] = useState("");
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [creating, setCreating] = useState(false);

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleCreate = async () => {
    if (!playlistName.trim()) return;

    setCreating(true);
    try {
      if (isCollaborative) {
        const response = await fetch("/api/collaborative-playlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: playlistName,
            userId: user.id,
            userName: user.name,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          router.push(`/collaborative-playlist/${data.playlist.id}`);
        }
      } else {
        const response = await fetch("/api/playlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: playlistName,
            userId: user.id,
          }),
        });
        if (response.ok) {
          router.push("/mobile");
        }
      }
    } catch (error) {
      console.error("Failed to create playlist:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Buat Playlist</h1>
        <div className="w-7" />
      </header>

      <div className="flex-1 px-4 py-6">
        {/* Playlist Type Selection */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => setIsCollaborative(false)}
            className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
              !isCollaborative
                ? "bg-[#1DB954]/20 border-2 border-[#1DB954]"
                : "bg-[#282828] border-2 border-transparent"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              !isCollaborative ? "bg-[#1DB954]" : "bg-[#3e3e3e]"
            }`}>
              <Music size={24} className={!isCollaborative ? "text-black" : "text-white"} />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">Playlist Biasa</p>
              <p className="text-[#b3b3b3] text-sm">Hanya kamu yang bisa mengedit</p>
            </div>
          </button>

          <button
            onClick={() => setIsCollaborative(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
              isCollaborative
                ? "bg-[#1DB954]/20 border-2 border-[#1DB954]"
                : "bg-[#282828] border-2 border-transparent"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCollaborative ? "bg-[#1DB954]" : "bg-[#3e3e3e]"
            }`}>
              <Users size={24} className={isCollaborative ? "text-black" : "text-white"} />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">Playlist Kolaboratif</p>
              <p className="text-[#b3b3b3] text-sm">Undang teman untuk mengedit bersama</p>
            </div>
          </button>
        </div>

        {/* Playlist Name Input */}
        <div className="mb-8">
          <label className="block text-[#b3b3b3] text-sm mb-2">Nama Playlist</label>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder={isCollaborative ? "Playlist Bersama" : "Playlist Saya"}
            className="w-full bg-[#282828] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder:text-[#727272]"
            autoFocus
          />
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={!playlistName.trim() || creating}
          className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full hover:bg-[#1ed760] disabled:opacity-50 disabled:hover:bg-[#1DB954] transition-colors"
        >
          {creating ? "Membuat..." : "Buat Playlist"}
        </button>
      </div>
    </div>
  );
}
