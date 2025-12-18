"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Camera, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import MobilePlayer from "@/components/mobile/mobile-player";
import MobileNavigation from "@/components/mobile/mobile-navigation";

export default function MobileProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTrack } = usePlayer();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSave = () => {
    // In real app, save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-white text-lg font-bold">Profil</h1>
        </div>
        <button 
          onClick={handleSave}
          className="text-[#1DB954] font-bold"
        >
          {saved ? <Check size={24} /> : "Simpan"}
        </button>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 py-6 ${bottomPadding}`}>
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1DB954] to-[#169c46] flex items-center justify-center">
              <span className="text-white font-bold text-4xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Camera size={16} className="text-black" />
            </button>
          </div>
          <p className="text-[#b3b3b3] text-sm mt-3">Tap untuk ganti foto</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-[#b3b3b3] text-sm mb-2">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#282828] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
          </div>
          <div>
            <label className="block text-[#b3b3b3] text-sm mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-[#282828] text-[#b3b3b3] px-4 py-3 rounded-lg opacity-60"
            />
            <p className="text-[#535353] text-xs mt-1">Email tidak dapat diubah</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-[#282828] rounded-lg p-4 text-center">
            <p className="text-white text-2xl font-bold">0</p>
            <p className="text-[#b3b3b3] text-xs">Playlist</p>
          </div>
          <div className="bg-[#282828] rounded-lg p-4 text-center">
            <p className="text-white text-2xl font-bold">0</p>
            <p className="text-[#b3b3b3] text-xs">Disukai</p>
          </div>
          <div className="bg-[#282828] rounded-lg p-4 text-center">
            <p className="text-white text-2xl font-bold">0</p>
            <p className="text-[#b3b3b3] text-xs">Mengikuti</p>
          </div>
        </div>
      </div>

      <MobilePlayer />
      <MobileNavigation activeTab="home" onTabChange={() => router.push("/mobile")} />
    </div>
  );
}
