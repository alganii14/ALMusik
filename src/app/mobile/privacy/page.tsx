"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff, Users, Activity, Shield } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import MobilePlayer from "@/components/mobile/mobile-player";
import MobileNavigation from "@/components/mobile/mobile-navigation";

export default function MobilePrivacyPage() {
  const router = useRouter();
  const { currentTrack } = usePlayer();
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";
  const [privateSession, setPrivateSession] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [showListening, setShowListening] = useState(true);

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Privasi</h1>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 py-4 ${bottomPadding}`}>
        {/* Private Session */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {privateSession ? (
                <EyeOff size={20} className="text-[#1DB954]" />
              ) : (
                <Eye size={20} className="text-[#b3b3b3]" />
              )}
              <div>
                <p className="text-white font-medium">Sesi Privat</p>
                <p className="text-[#b3b3b3] text-xs">Sembunyikan aktivitas mendengarkan</p>
              </div>
            </div>
            <button
              onClick={() => setPrivateSession(!privateSession)}
              className={`w-12 h-7 rounded-full transition-colors ${
                privateSession ? "bg-[#1DB954]" : "bg-[#535353]"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                privateSession ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
          {privateSession && (
            <p className="text-[#1DB954] text-xs mt-3 pl-8">
              Sesi privat aktif. Aktivitasmu tidak akan terlihat.
            </p>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Pengaturan Privasi
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {/* Show Activity */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#282828]">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-[#b3b3b3]" />
                <div>
                  <p className="text-white text-sm">Tampilkan Aktivitas</p>
                  <p className="text-[#b3b3b3] text-xs">Teman bisa lihat aktivitasmu</p>
                </div>
              </div>
              <button
                onClick={() => setShowActivity(!showActivity)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  showActivity ? "bg-[#1DB954]" : "bg-[#535353]"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                  showActivity ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Show What I'm Listening */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-[#b3b3b3]" />
                <div>
                  <p className="text-white text-sm">Sedang Didengarkan</p>
                  <p className="text-[#b3b3b3] text-xs">Tampilkan lagu yang diputar</p>
                </div>
              </div>
              <button
                onClick={() => setShowListening(!showListening)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  showListening ? "bg-[#1DB954]" : "bg-[#535353]"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                  showListening ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-[#b3b3b3]" />
            <p className="text-white font-medium">Data & Privasi</p>
          </div>
          <p className="text-[#b3b3b3] text-xs mb-3">
            Kami menghargai privasimu. Data kamu aman bersama kami.
          </p>
          <button className="text-[#1DB954] text-sm font-medium">
            Pelajari lebih lanjut →
          </button>
        </div>
      </div>

      <MobilePlayer />
      <MobileNavigation activeTab="home" onTabChange={() => router.push("/mobile")} />
    </div>
  );
}
