"use client";

import React from "react";
import Link from "next/link";
import { Play, Pause } from "lucide-react";
import { useSongs } from "@/context/songs-context";
import { usePlayer, Track } from "@/context/player-context";

export default function QuickPicksSection() {
  const { songs } = useSongs();
  const { play, pause, isPlaying, setQueue, playSource } = usePlayer();

  // Only show pause if playing from LT12
  const isPlayingFromLT12 = isPlaying && playSource === "lt12";

  const handlePlayAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (songs.length === 0) return;

    // Set queue with all songs
    const tracks: Track[] = songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.cover,
      audioUrl: song.audioUrl,
      duration: song.duration,
      lyrics: song.lyrics,
    }));
    setQueue(tracks);

    // Toggle play/pause only if playing from LT12
    if (isPlayingFromLT12) {
      pause();
    } else {
      // Play first song with source "lt12"
      play(tracks[0], "lt12");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button className="px-4 py-1.5 bg-white text-black text-sm font-medium rounded-full">
          All
        </button>
        <button className="px-4 py-1.5 bg-[#232323] text-white text-sm font-medium rounded-full hover:bg-[#2a2a2a] transition-colors">
          Music
        </button>
        <button className="px-4 py-1.5 bg-[#232323] text-white text-sm font-medium rounded-full hover:bg-[#2a2a2a] transition-colors">
          Podcasts
        </button>
      </div>

      {/* Grid - Only LT12 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        <Link
          href="/section/trending-songs"
          className="flex items-center bg-[#ffffff12] hover:bg-[#ffffff26] rounded-md overflow-hidden group transition-colors"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">LT12</span>
          </div>
          <span className="px-3 text-white text-sm font-semibold truncate flex-1">LT12</span>
          <div className={`pr-2 transition-opacity ${isPlayingFromLT12 ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <button 
              onClick={handlePlayAll}
              className="w-8 h-8 bg-[#1ed760] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlayingFromLT12 ? (
                <Pause className="w-4 h-4 text-black" fill="black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" fill="black" />
              )}
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}
