"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Pause, Clock3, Heart, MoreHorizontal, Music, ChevronLeft } from "lucide-react";
import { useSongs } from "@/context/songs-context";
import { usePlayer, Track } from "@/context/player-context";
import NavigationHeader from "@/components/sections/navigation-header";
import SidebarLibrary from "@/components/sections/sidebar-library";
import PlayerControls from "@/components/sections/player-controls";

export default function SongPage() {
  const params = useParams();
  const songId = params.id as string;
  const { songs } = useSongs();
  const { play, currentTrack, isPlaying, pause } = usePlayer();
  const [song, setSong] = useState<typeof songs[0] | null>(null);

  useEffect(() => {
    const found = songs.find((s) => s.id === songId);
    if (found) setSong(found);
  }, [songs, songId]);

  const handlePlay = () => {
    if (!song) return;
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.cover,
      audioUrl: song.audioUrl,
      duration: song.duration,
      lyrics: song.lyrics,
    };
    if (currentTrack?.id === song.id && isPlaying) {
      pause();
    } else {
      play(track);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isCurrentlyPlaying = currentTrack?.id === song?.id && isPlaying;

  if (!song) {
    return (
      <div className="min-h-screen bg-[#121212] overflow-hidden">
        <NavigationHeader />
        <div className="flex pt-[64px] pb-[180px]">
          <aside className="hidden lg:block w-[300px] h-[calc(100vh-64px-180px)] fixed left-0 top-[64px] p-2">
            <SidebarLibrary />
          </aside>
          <main className="flex-1 lg:ml-[300px] overflow-y-auto h-[calc(100vh-64px-180px)] bg-[#121212] rounded-lg mx-2 lg:mx-0 lg:mr-2">
            <div className="flex items-center justify-center h-full">
              <p className="text-[#b3b3b3]">Memuat...</p>
            </div>
          </main>
        </div>
        <div className="pb-[72px]">
          <PlayerControls />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] overflow-hidden">
      <NavigationHeader />

      <div className="flex pt-[64px] pb-[180px]">
        <aside className="hidden lg:block w-[300px] h-[calc(100vh-64px-180px)] fixed left-0 top-[64px] p-2">
          <SidebarLibrary />
        </aside>

        <main className="flex-1 lg:ml-[300px] overflow-y-auto h-[calc(100vh-64px-180px)] bg-[#121212] rounded-lg mx-2 lg:mx-0 lg:mr-2">
          {/* Header with gradient */}
          <div className="bg-gradient-to-b from-[#5c3d6e] via-[#3d2a4a] to-[#121212]">
            {/* Back button */}
            <div className="px-6 pt-4">
              <Link href="/" className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
                <span className="text-sm font-medium">Kembali</span>
              </Link>
            </div>

            {/* Song Info */}
            <div className="flex items-end gap-6 p-6 pt-4">
              <div className="w-[232px] h-[232px] flex-shrink-0 shadow-2xl rounded-md overflow-hidden">
                {song.cover ? (
                  <Image
                    src={song.cover}
                    alt={song.title}
                    width={232}
                    height={232}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                    <Music className="w-20 h-20 text-[#7f7f7f]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-white uppercase">Lagu</span>
                <h1 className="text-5xl font-bold text-white line-clamp-2">{song.title}</h1>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm font-semibold text-white">{song.artist}</span>
                  <span className="text-[#b3b3b3]">•</span>
                  <span className="text-sm text-[#b3b3b3]">{formatDuration(song.duration)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 px-6 py-4">
              <button
                onClick={handlePlay}
                className="w-14 h-14 bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 rounded-full flex items-center justify-center transition-all shadow-lg"
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-6 h-6 text-black" fill="black" />
                ) : (
                  <Play className="w-6 h-6 text-black ml-1" fill="black" />
                )}
              </button>
              <button className="text-[#b3b3b3] hover:text-white transition-colors">
                <Heart className="w-8 h-8" />
              </button>
              <button className="text-[#b3b3b3] hover:text-white transition-colors">
                <MoreHorizontal className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Song Table */}
          <div className="px-6 py-4">
            <table className="w-full">
              <thead>
                <tr className="text-[#b3b3b3] text-sm border-b border-[#ffffff1a]">
                  <th className="text-left pb-2 font-normal w-12">#</th>
                  <th className="text-left pb-2 font-normal">Judul</th>
                  <th className="text-right pb-2 font-normal pr-4">
                    <Clock3 className="w-4 h-4 inline" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  onClick={handlePlay}
                  className={`hover:bg-[#ffffff1a] cursor-pointer group ${isCurrentlyPlaying ? "bg-[#ffffff1a]" : ""}`}
                >
                  <td className="py-3 text-[#b3b3b3] w-12">
                    {isCurrentlyPlaying ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="w-3 h-3 bg-[#1ed760] rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <span className="group-hover:hidden">1</span>
                        <Play className="w-4 h-4 hidden group-hover:block text-white" fill="white" />
                      </>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        {song.cover ? (
                          <Image
                            src={song.cover}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                            <Music className="w-4 h-4 text-[#7f7f7f]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`text-base font-medium ${isCurrentlyPlaying ? "text-[#1ed760]" : "text-white"}`}>
                          {song.title}
                        </p>
                        <p className="text-sm text-[#b3b3b3]">{song.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-sm text-[#b3b3b3] pr-4">
                    {formatDuration(song.duration)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lyrics Section */}
          {song.lyrics && (
            <div className="px-6 py-6 mt-4 mx-6 bg-[#1a1a1a] rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Lirik</h3>
              <p className="text-[#b3b3b3] whitespace-pre-line leading-relaxed">{song.lyrics}</p>
            </div>
          )}
        </main>
      </div>

      <div className="pb-[72px]">
        <PlayerControls />
      </div>
    </div>
  );
}
