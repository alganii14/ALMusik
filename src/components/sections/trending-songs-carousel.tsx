"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Pause } from "lucide-react";
import { usePlayer, Track } from "@/context/player-context";
import { useSongs } from "@/context/songs-context";

export default function TrendingSongsCarousel() {
  const { play, currentTrack, isPlaying, pause, setQueue, playSource } = usePlayer();
  const { songs, isLoading: loading } = useSongs();
  const router = useRouter();

  useEffect(() => {
    if (songs.length > 0) {
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
    }
  }, [songs, setQueue]);

  const handlePlaySong = (song: (typeof songs)[0]) => {
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.cover,
      audioUrl: song.audioUrl,
      duration: song.duration,
      lyrics: song.lyrics,
    };

    // Only pause if this exact song is playing from card source
    if (currentTrack?.id === track.id && isPlaying && playSource === "card") {
      pause();
    } else {
      play(track, "card");
    }
  };

  if (loading) {
    return (
      <section className="flex flex-col gap-4 text-white">
        <h2 className="text-2xl font-bold">Trending Songs</h2>
        <div className="flex gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[180px] animate-pulse">
              <div className="w-full aspect-square bg-[#282828] rounded-md mb-4" />
              <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#282828] rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (songs.length === 0) {
    return (
      <section className="flex flex-col gap-4 text-white">
        <h2 className="text-2xl font-bold">Trending Songs</h2>
        <p className="text-[#b3b3b3]">Belum ada lagu. Upload lagu di halaman admin.</p>
      </section>
    );
  }

  return (
    <section aria-label="Trending Songs" className="flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
          <Link href="/section/trending-songs">Trending Songs</Link>
        </h2>
        <Link
          href="/section/trending-songs"
          className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline uppercase tracking-wider mt-1"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="relative -mx-6 px-6 overflow-hidden">
        <div
          className="flex gap-6 overflow-x-auto pb-6 -mb-6 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {songs.slice(0, 10).map((song) => {
            // Only show pause if this song is playing from card source
            const isCurrentlyPlaying = currentTrack?.id === song.id && isPlaying && playSource === "card";
            return (
              <div
                key={song.id}
                className="group flex flex-col p-4 rounded-md bg-[#181818] hover:bg-[#282828] transition-colors duration-300 cursor-pointer min-w-[180px] w-[180px] snap-start"
                onClick={() => router.push(`/song/${song.id}`)}
              >
                <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
                  {song.cover ? (
                    <Image src={song.cover} alt={song.title} fill className="object-cover" sizes="180px" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                      <svg className="w-12 h-12 text-[#7f7f7f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song);
                    }}
                    className={`absolute right-2 bottom-2 ${isCurrentlyPlaying ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"} transition-all duration-300 shadow-[0_8px_8px_rgba(0,0,0,0.3)] z-10`}
                  >
                    <div className="bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 w-12 h-12 rounded-full flex items-center justify-center transition-transform">
                      {isCurrentlyPlaying ? (
                        <Pause className="fill-black text-black" size={24} strokeWidth={0} />
                      ) : (
                        <Play className="fill-black text-black ml-1" size={24} strokeWidth={0} />
                      )}
                    </div>
                  </button>
                </div>
                <div className="flex flex-col gap-1 min-h-[62px]">
                  <div
                    className={`text-base font-bold truncate w-full ${isCurrentlyPlaying ? "text-[#1DB954]" : "text-white"}`}
                  >
                    {song.title}
                  </div>
                  <div className="text-[#a7a7a7] text-sm truncate">{song.artist}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
