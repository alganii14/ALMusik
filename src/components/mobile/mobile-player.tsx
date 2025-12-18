"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Pause, Heart, Music } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { useFavorites } from "@/context/favorites-context";
import MobilePlayerFull from "./mobile-player-full";

export default function MobilePlayer() {
  const { currentTrack, isPlaying, togglePlay, progress, duration } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <>
      {/* Mini Player - positioned above navigation */}
      <div 
        className="fixed bottom-[56px] left-0 right-0 max-w-md mx-auto z-40 px-2"
        onClick={() => setShowFullPlayer(true)}
      >
        <div className="bg-[#5c3d6e] rounded-md mx-1 shadow-lg relative overflow-hidden">
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffffff30]">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-3 p-2 pt-2.5">
            {/* Album Art */}
            <div className="w-11 h-11 rounded-md overflow-hidden flex-shrink-0 shadow-md">
              {currentTrack.imageUrl ? (
                <Image
                  src={currentTrack.imageUrl}
                  alt={currentTrack.title}
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                  <Music size={18} className="text-[#7f7f7f]" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {currentTrack.title}
              </p>
              <p className="text-white/70 text-xs truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                className={`w-9 h-9 flex items-center justify-center ${
                  isLiked ? "text-[#1db954]" : "text-white"
                }`}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 flex items-center justify-center text-white"
              >
                {isPlaying ? (
                  <Pause size={26} fill="currentColor" />
                ) : (
                  <Play size={26} fill="currentColor" className="ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Player */}
      {showFullPlayer && (
        <MobilePlayerFull onClose={() => setShowFullPlayer(false)} />
      )}
    </>
  );
}
