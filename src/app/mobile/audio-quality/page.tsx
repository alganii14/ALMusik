"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Wifi, WifiOff } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import MobilePlayer from "@/components/mobile/mobile-player";
import MobileNavigation from "@/components/mobile/mobile-navigation";

type Quality = "auto" | "low" | "normal" | "high" | "very_high";

export default function MobileAudioQualityPage() {
  const router = useRouter();
  const { currentTrack } = usePlayer();
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";
  const [streamingQuality, setStreamingQuality] = useState<Quality>("auto");
  const [downloadQuality, setDownloadQuality] = useState<Quality>("high");
  const [dataSaver, setDataSaver] = useState(false);

  const qualities = [
    { id: "auto" as Quality, label: "Otomatis", desc: "Sesuaikan dengan koneksi" },
    { id: "low" as Quality, label: "Rendah", desc: "~24 kbps" },
    { id: "normal" as Quality, label: "Normal", desc: "~96 kbps" },
    { id: "high" as Quality, label: "Tinggi", desc: "~160 kbps" },
    { id: "very_high" as Quality, label: "Sangat Tinggi", desc: "~320 kbps" },
  ];

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Kualitas Audio</h1>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 py-4 ${bottomPadding}`}>
        {/* Data Saver */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dataSaver ? (
                <WifiOff size={20} className="text-[#1DB954]" />
              ) : (
                <Wifi size={20} className="text-[#b3b3b3]" />
              )}
              <div>
                <p className="text-white font-medium">Penghemat Data</p>
                <p className="text-[#b3b3b3] text-xs">Kurangi penggunaan data</p>
              </div>
            </div>
            <button
              onClick={() => setDataSaver(!dataSaver)}
              className={`w-12 h-7 rounded-full transition-colors ${
                dataSaver ? "bg-[#1DB954]" : "bg-[#535353]"
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                dataSaver ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Streaming Quality */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Kualitas Streaming
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {qualities.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setStreamingQuality(q.id)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#282828] transition-colors ${
                  index !== qualities.length - 1 ? "border-b border-[#282828]" : ""
                }`}
              >
                <div>
                  <p className="text-white text-sm text-left">{q.label}</p>
                  <p className="text-[#b3b3b3] text-xs">{q.desc}</p>
                </div>
                {streamingQuality === q.id && (
                  <Check size={20} className="text-[#1DB954]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Download Quality */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Kualitas Download
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {qualities.filter(q => q.id !== "auto").map((q, index, arr) => (
              <button
                key={q.id}
                onClick={() => setDownloadQuality(q.id)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#282828] transition-colors ${
                  index !== arr.length - 1 ? "border-b border-[#282828]" : ""
                }`}
              >
                <div>
                  <p className="text-white text-sm text-left">{q.label}</p>
                  <p className="text-[#b3b3b3] text-xs">{q.desc}</p>
                </div>
                {downloadQuality === q.id && (
                  <Check size={20} className="text-[#1DB954]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[#535353] text-xs text-center px-4">
          Kualitas audio yang lebih tinggi menggunakan lebih banyak data
        </p>
      </div>

      <MobilePlayer />
      <MobileNavigation activeTab="home" onTabChange={() => router.push("/mobile")} />
    </div>
  );
}
