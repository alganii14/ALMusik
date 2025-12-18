"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Moon, Sun, Smartphone } from "lucide-react";

type Theme = "dark" | "light" | "system";

export default function MobileAppearancePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const [showLyrics, setShowLyrics] = useState(true);
  const [showCanvas, setShowCanvas] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const themes = [
    { id: "dark" as Theme, label: "Gelap", icon: Moon, desc: "Tema gelap untuk mata" },
    { id: "light" as Theme, label: "Terang", icon: Sun, desc: "Tema terang klasik" },
    { id: "system" as Theme, label: "Sistem", icon: Smartphone, desc: "Ikuti pengaturan perangkat" },
  ];

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Tampilan</h1>
      </header>

      <div className="px-4 py-4">
        {/* Theme Selection */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Tema
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {themes.map((t, index) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#282828] transition-colors ${
                    index !== themes.length - 1 ? "border-b border-[#282828]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className="text-[#b3b3b3]" />
                    <div>
                      <p className="text-white text-sm text-left">{t.label}</p>
                      <p className="text-[#b3b3b3] text-xs">{t.desc}</p>
                    </div>
                  </div>
                  {theme === t.id && (
                    <Check size={20} className="text-[#1DB954]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Options */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Opsi Tampilan
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            {/* Show Lyrics */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828]">
              <div>
                <p className="text-white text-sm">Tampilkan Lirik</p>
                <p className="text-[#b3b3b3] text-xs">Lirik saat memutar lagu</p>
              </div>
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  showLyrics ? "bg-[#1DB954]" : "bg-[#535353]"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                  showLyrics ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Show Canvas */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828]">
              <div>
                <p className="text-white text-sm">Canvas</p>
                <p className="text-[#b3b3b3] text-xs">Animasi visual saat memutar</p>
              </div>
              <button
                onClick={() => setShowCanvas(!showCanvas)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  showCanvas ? "bg-[#1DB954]" : "bg-[#535353]"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                  showCanvas ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-white text-sm">Mode Kompak</p>
                <p className="text-[#b3b3b3] text-xs">Tampilan lebih ringkas</p>
              </div>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  compactMode ? "bg-[#1DB954]" : "bg-[#535353]"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                  compactMode ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-[#535353] text-xs text-center">
          Beberapa pengaturan mungkin memerlukan restart aplikasi
        </p>
      </div>
    </div>
  );
}
