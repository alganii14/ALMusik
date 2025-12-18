"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Pause, SkipBack, SkipForward, Heart, Music } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { useFavorites } from "@/context/favorites-context";
import MobilePlayerFull from "./mobile-player-full";

export default function MobilePlayer() {
  const { currentTrack, isPlaying, togglePlay, next, previous, progress, duration } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <>
      {/* Mini Player */}
      <div 
        className="fixed bottom-[60px] left-0 right-0 max-w-md mx-auto z-30 px-2"
        onClick={() => setShowFullPlayer(true)}
      >
        <div className="bg-[#382b47] rounded-lg p-2 mx-2 shadow-lg">
          {/* Progress bar */}
          <div className="absolute top-0 left-4 right-4 h-0.5 bg-[#4d4d4d] rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Album Art */}
            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
              {currentTrack.imageUrl ? (
                <Image
                  src={currentTrack.imageUrl}
                  alt={currentTrack.title}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                  <Music size={16} className="text-[#7f7f7f]" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {currentTrack.title}
              </p>
              <p className="text-[#b3b3b3] text-xs truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
                className={`w-8 h-8 flex items-center justify-center ${
                  isLiked ? "text-[#1db954]" : "text-white"
                }`}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center text-white"
              >
                {isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" className="ml-0.5" />
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
