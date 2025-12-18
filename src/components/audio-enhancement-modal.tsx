"use client";

import { useState } from "react";
import { X, Sliders, Music2, Waves, Volume2, Sparkles } from "lucide-react";
import { usePlayer, AudioPreset } from "@/context/player-context";

const PRESET_LABELS: Record<AudioPreset, { name: string; icon: string }> = {
  flat: { name: "Flat", icon: "━" },
  bass_boost: { name: "Bass Boost", icon: "🔊" },
  vocal: { name: "Vocal", icon: "🎤" },
  electronic: { name: "Electronic", icon: "🎹" },
  rock: { name: "Rock", icon: "🎸" },
  jazz: { name: "Jazz", icon: "🎷" },
  classical: { name: "Classical", icon: "🎻" },
  custom: { name: "Custom", icon: "⚙️" },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioEnhancementModal({ isOpen, onClose }: Props) {
  const { audioEnhancement, setAudioEnhancement, setAudioPreset } = usePlayer();
  const [activeTab, setActiveTab] = useState<"equalizer" | "effects">("equalizer");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
      <div className="bg-[#282828] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#404040]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
              <Sliders size={20} className="text-[#1DB954]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Audio Enhancement</h2>
              <p className="text-[#b3b3b3] text-xs">Tingkatkan kualitas audio</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#b3b3b3] hover:text-white p-2">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#404040]">
          <button
            onClick={() => setActiveTab("equalizer")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "equalizer" ? "text-white border-b-2 border-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Music2 size={16} className="inline mr-2" />
            Equalizer
          </button>
          <button
            onClick={() => setActiveTab("effects")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "effects" ? "text-white border-b-2 border-[#1DB954]" : "text-[#b3b3b3] hover:text-white"
            }`}
          >
            <Sparkles size={16} className="inline mr-2" />
            Effects
          </button>
        </div>

        <div className="p-4">
          {activeTab === "equalizer" && (
            <div className="space-y-6">
              {/* Presets */}
              <div>
                <label className="text-[#b3b3b3] text-sm mb-3 block">Preset</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(PRESET_LABELS) as AudioPreset[]).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAudioPreset(preset)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        audioEnhancement.preset === preset
                          ? "bg-[#1DB954] text-black"
                          : "bg-[#3e3e3e] text-white hover:bg-[#4e4e4e]"
                      }`}
                    >
                      <span className="text-lg block mb-1">{PRESET_LABELS[preset].icon}</span>
                      <span className="text-[10px] font-medium">{PRESET_LABELS[preset].name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* EQ Sliders */}
              <div className="space-y-4">
                {/* Bass */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white text-sm font-medium">Bass</label>
                    <span className="text-[#1DB954] text-sm font-mono">{audioEnhancement.bass > 0 ? "+" : ""}{audioEnhancement.bass} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={audioEnhancement.bass}
                    onChange={(e) => setAudioEnhancement({ bass: Number(e.target.value) })}
                    className="w-full h-2 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#1DB954]"
                  />
                  <div className="flex justify-between text-[10px] text-[#727272] mt-1">
                    <span>-12</span>
                    <span>0</span>
                    <span>+12</span>
                  </div>
                </div>

                {/* Mid */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white text-sm font-medium">Mid</label>
                    <span className="text-[#1DB954] text-sm font-mono">{audioEnhancement.mid > 0 ? "+" : ""}{audioEnhancement.mid} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={audioEnhancement.mid}
                    onChange={(e) => setAudioEnhancement({ mid: Number(e.target.value) })}
                    className="w-full h-2 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#1DB954]"
                  />
                  <div className="flex justify-between text-[10px] text-[#727272] mt-1">
                    <span>-12</span>
                    <span>0</span>
                    <span>+12</span>
                  </div>
                </div>

                {/* Treble */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-white text-sm font-medium">Treble</label>
                    <span className="text-[#1DB954] text-sm font-mono">{audioEnhancement.treble > 0 ? "+" : ""}{audioEnhancement.treble} dB</span>
                  </div>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={audioEnhancement.treble}
                    onChange={(e) => setAudioEnhancement({ treble: Number(e.target.value) })}
                    className="w-full h-2 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-[#1DB954]"
                  />
                  <div className="flex justify-between text-[10px] text-[#727272] mt-1">
                    <span>-12</span>
                    <span>0</span>
                    <span>+12</span>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setAudioPreset("flat")}
                className="w-full py-2 text-[#b3b3b3] hover:text-white text-sm transition-colors"
              >
                Reset ke Default
              </button>
            </div>
          )}

          {activeTab === "effects" && (
            <div className="space-y-4">
              {/* Spatial Audio */}
              <div className="flex items-center justify-between p-4 bg-[#3e3e3e] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                    <Waves size={20} className="text-[#1DB954]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Spatial Audio</p>
                    <p className="text-[#b3b3b3] text-xs">Efek suara 3D immersive</p>
                  </div>
                </div>
                <button
                  onClick={() => setAudioEnhancement({ spatialAudio: !audioEnhancement.spatialAudio })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    audioEnhancement.spatialAudio ? "bg-[#1DB954]" : "bg-[#4d4d4d]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      audioEnhancement.spatialAudio ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Normalizer */}
              <div className="flex items-center justify-between p-4 bg-[#3e3e3e] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                    <Volume2 size={20} className="text-[#1DB954]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Normalizer</p>
                    <p className="text-[#b3b3b3] text-xs">Seimbangkan volume antar lagu</p>
                  </div>
                </div>
                <button
                  onClick={() => setAudioEnhancement({ normalizer: !audioEnhancement.normalizer })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    audioEnhancement.normalizer ? "bg-[#1DB954]" : "bg-[#4d4d4d]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      audioEnhancement.normalizer ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-lg p-3">
                <p className="text-sm text-[#b3b3b3]">
                  💡 Audio enhancement menggunakan Web Audio API untuk meningkatkan kualitas suara secara real-time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
