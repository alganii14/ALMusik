"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause } from "lucide-react";
import { usePlayer, SAMPLE_TRACKS, Track } from "@/context/player-context";

interface SpotifySong {
  id: string;
  title: string;
  artist: string;
  cover: string;
  album: string;
  preview_url: string;
  duration_ms: number;
}

export default function TrendingSongsCarousel() {
  const { play, currentTrack, isPlaying, pause, setQueue } = usePlayer();
  const [songs, setSongs] = useState<SpotifySong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpotifySongs() {
      try {
        const response = await fetch("/api/spotify?type=trending");
        const data = await response.json();
        if (data.songs && data.songs.length > 0) {
          setSongs(data.songs);
          const tracks: Track[] = data.songs.map((song: SpotifySong) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            imageUrl: song.cover,
            previewUrl: song.preview_url,
            duration: Math.floor(song.duration_ms / 1000),
          }));
          setQueue(tracks);
        }
      } catch (error) {
        console.error("Failed to fetch Spotify songs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSpotifySongs();
  }, [setQueue]);

  const handlePlaySong = (song: SpotifySong) => {
    const track: Track = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      imageUrl: song.cover,
      previewUrl: song.preview_url,
      duration: Math.floor(song.duration_ms / 1000),
    };
    
    if (currentTrack?.id === track.id && isPlaying) {
      pause();
    } else {
      play(track);
    }
  };

  const handlePlayFallback = (songId: string) => {
    const track = SAMPLE_TRACKS.find(t => t.id === songId);
    if (track) {
      if (currentTrack?.id === track.id && isPlaying) {
        pause();
      } else {
        play(track);
      }
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

  const displaySongs = songs.length > 0 ? songs : null;

  if (!displaySongs) {
    return (
      <section aria-label="Lagu Populer Indonesia" className="flex flex-col gap-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
            <Link href="/section/trending-songs">Lagu Populer Indonesia</Link>
          </h2>
          <Link href="/section/trending-songs" className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline uppercase tracking-wider mt-1">
            Lihat Semua
          </Link>
        </div>
        <div className="relative -mx-6 px-6 overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-6 -mb-6 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {SAMPLE_TRACKS.map((track) => {
              const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div key={track.id} className="group flex flex-col p-4 rounded-md bg-[#181818] hover:bg-[#282828] transition-colors duration-300 cursor-pointer min-w-[180px] w-[180px] snap-start" onClick={() => handlePlayFallback(track.id)}>
                  <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
                    <Image src={track.imageUrl} alt={track.title} fill className="object-cover" sizes="180px" />
                    <div className={`absolute right-2 bottom-2 ${isCurrentlyPlaying ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'} transition-all duration-300 shadow-[0_8px_8px_rgba(0,0,0,0.3)] z-10`}>
                      <div className="bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 w-12 h-12 rounded-full flex items-center justify-center transition-transform">
                        {isCurrentlyPlaying ? <Pause className="fill-black text-black" size={24} strokeWidth={0} /> : <Play className="fill-black text-black ml-1" size={24} strokeWidth={0} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-h-[62px]">
                    <div className={`text-base font-bold truncate w-full ${isCurrentlyPlaying ? 'text-[#1DB954]' : 'text-white'}`}>{track.title}</div>
                    <div className="text-[#a7a7a7] text-sm truncate">{track.artist}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Trending Songs" className="flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
          <Link href="/section/trending-songs">Trending Songs</Link>
        </h2>
        <Link href="/section/trending-songs" className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline uppercase tracking-wider mt-1">
          Lihat Semua
        </Link>
      </div>

      <div className="relative -mx-6 px-6 overflow-hidden">
        <div className="flex gap-6 overflow-x-auto pb-6 -mb-6 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {displaySongs.map((song) => {
            const isCurrentlyPlaying = currentTrack?.id === song.id && isPlaying;
            return (
              <div key={song.id} className="group flex flex-col p-4 rounded-md bg-[#181818] hover:bg-[#282828] transition-colors duration-300 cursor-pointer min-w-[180px] w-[180px] snap-start" onClick={() => handlePlaySong(song)}>
                <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
                  <Image src={song.cover} alt={song.title} fill className="object-cover" sizes="180px" />
                  <div className={`absolute right-2 bottom-2 ${isCurrentlyPlaying ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'} transition-all duration-300 shadow-[0_8px_8px_rgba(0,0,0,0.3)] z-10`}>
                    <div className="bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 w-12 h-12 rounded-full flex items-center justify-center transition-transform">
                      {isCurrentlyPlaying ? <Pause className="fill-black text-black" size={24} strokeWidth={0} /> : <Play className="fill-black text-black ml-1" size={24} strokeWidth={0} />}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 min-h-[62px]">
                  <div className={`text-base font-bold truncate w-full ${isCurrentlyPlaying ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</div>
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