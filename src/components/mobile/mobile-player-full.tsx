"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Share2,
  ListMusic,
  Mic2,
  Music,
} from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { useFavorites } from "@/context/favorites-context";

interface MobilePlayerFullProps {
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MobilePlayerFull({ onClose }: MobilePlayerFullProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    isShuffle,
    isRepeat,
    togglePlay,
    next,
    previous,
    seek,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useFavorites();
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-gradient-to-b from-[#5c3d6e] via-[#2a1a35] to-[#121212] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="p-2 text-white">
          <ChevronDown size={28} />
        </button>
        <div className="text-center">
          <p className="text-[#b3b3b3] text-xs uppercase tracking-wider">
            Sedang Diputar
          </p>
          <p className="text-white text-sm font-medium">
            {currentTrack.artist}
          </p>
        </div>
        <button className="p-2 text-white">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        <div className="w-full max-w-[320px] aspect-square rounded-lg overflow-hidden shadow-2xl">
          {currentTrack.imageUrl ? (
            <Image
              src={currentTrack.imageUrl}
              alt={currentTrack.title}
              width={320}
              height={320}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-[#282828] flex items-center justify-center">
              <Music size={80} className="text-[#7f7f7f]" />
            </div>
          )}
        </div>
      </div>

      {/* Track Info & Controls */}
      <div className="px-6 pb-8">
        {/* Track Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-xl font-bold truncate">
              {currentTrack.title}
            </h2>
            <p className="text-[#b3b3b3] text-base truncate">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-2 ${isLiked ? "text-[#1db954]" : "text-white"}`}
          >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            ref={progressRef}
            className="h-1 bg-[#4d4d4d] rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-white rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#b3b3b3]">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 ${isShuffle ? "text-[#1db954]" : "text-white"}`}
          >
            <Shuffle size={22} />
          </button>
          <button onClick={previous} className="p-2 text-white">
            <SkipBack size={32} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause size={32} fill="black" className="text-black" />
            ) : (
              <Play size={32} fill="black" className="text-black ml-1" />
            )}
          </button>
          <button onClick={next} className="p-2 text-white">
            <SkipForward size={32} fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-2 ${isRepeat ? "text-[#1db954]" : "text-white"}`}
          >
            <Repeat size={22} />
          </button>
        </div>

        {/* Extra Controls */}
        <div className="flex items-center justify-between">
          <button className="p-2 text-[#b3b3b3]">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setShowLyrics(!showLyrics)}
            className={`p-2 ${showLyrics ? "text-[#1db954]" : "text-[#b3b3b3]"}`}
          >
            <Mic2 size={20} />
          </button>
          <button className="p-2 text-[#b3b3b3]">
            <ListMusic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
