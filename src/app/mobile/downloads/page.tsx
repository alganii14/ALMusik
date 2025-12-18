"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Trash2, Music, HardDrive } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import MobilePlayer from "@/components/mobile/mobile-player";
import MobileNavigation from "@/components/mobile/mobile-navigation";

export default function MobileDownloadsPage() {
  const router = useRouter();
  const { currentTrack } = usePlayer();
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Download</h1>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 py-4 ${bottomPadding}`}>
        {/* Storage Info */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive size={20} className="text-[#1DB954]" />
            <p className="text-white font-medium">Penyimpanan</p>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#b3b3b3]">Terpakai</span>
              <span className="text-white">0 MB</span>
            </div>
            <div className="h-2 bg-[#282828] rounded-full overflow-hidden">
              <div className="h-full bg-[#1DB954] rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
          <p className="text-[#535353] text-xs">0 lagu didownload</p>
        </div>

        {/* Download Settings */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Pengaturan Download
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828]">
              <div>
                <p className="text-white text-sm">Download via WiFi saja</p>
                <p className="text-[#b3b3b3] text-xs">Hemat kuota data seluler</p>
              </div>
              <button className="w-12 h-7 rounded-full bg-[#1DB954]">
                <div className="w-5 h-5 bg-white rounded-full translate-x-5 mx-1" />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-white text-sm">Auto-download playlist</p>
                <p className="text-[#b3b3b3] text-xs">Download otomatis lagu baru</p>
              </div>
              <button className="w-12 h-7 rounded-full bg-[#535353]">
                <div className="w-5 h-5 bg-white rounded-full mx-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Downloaded Songs */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Lagu Terdownload
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg p-8 text-center">
            <Download size={48} className="text-[#535353] mx-auto mb-4" />
            <p className="text-white font-medium mb-1">Belum ada download</p>
            <p className="text-[#b3b3b3] text-sm">
              Download lagu untuk didengarkan offline
            </p>
          </div>
        </div>

        {/* Clear Downloads */}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:text-red-400 transition-colors">
          <Trash2 size={18} />
          <span className="font-medium">Hapus Semua Download</span>
        </button>

        <p className="text-[#535353] text-xs text-center mt-4">
          Fitur download akan segera hadir
        </p>
      </div>

      <MobilePlayer />
      <MobileNavigation activeTab="home" onTabChange={() => router.push("/mobile")} />
    </div>
  );
}
