"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Music, Clock, Heart } from "lucide-react";
import { usePlayer, Track } from "@/context/player-context";
import { useFavorites } from "@/context/favorites-context";
import { useAuth } from "@/context/auth-context";

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
  lyrics?: string;
}

export default function LikedSongsPage() {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const { play, pause, currentTrack, isPlaying, setQueue } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    // Filter songs based on favorites
    const likedSongs = allSongs.filter((song) => favorites.includes(song.id));
    setSongs(likedSongs);
    
    // Update queue
    if (likedSongs.length > 0) {
      const tracks: Track[] = likedSongs.map((song) => ({
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
  }, [favorites, allSongs, setQueue]);

  async function fetchSongs() {
    try {
      const response = await fetch("/api/music?type=all");
      const data = await response.json();
      setAllSongs(data.songs || []);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePlaySong(song: Song) {
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
  }

  function handlePlayAll() {
    if (songs.length === 0) return;
    const track: Track = {
      id: songs[0].id,
      title: songs[0].title,
      artist: songs[0].artist,
      imageUrl: songs[0].cover,
      audioUrl: songs[0].audioUrl,
      duration: songs[0].duration,
      lyrics: songs[0].lyrics,
    };
    play(track);
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
        <Heart size={64} className="text-[#b3b3b3] mb-4" />
        <p className="text-xl mb-4">Login untuk melihat lagu favoritmu</p>
        <Link href="/login" className="bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5038a0] to-[#121212] text-white pb-32">
      {/* Header */}
      <div className="pt-20 px-8 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[#b3b3b3] hover:text-white mb-6">
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </Link>

        <div className="flex items-end gap-6">
          <div className="w-48 h-48 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded shadow-2xl flex items-center justify-center flex-shrink-0">
            <Heart size={80} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Playlist</p>
            <h1 className="text-5xl font-bold mb-6">Lagu yang Disukai</h1>
            <p className="text-[#b3b3b3] text-sm">{user.name} • {songs.length} lagu</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 py-4 flex items-center gap-6">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-transform disabled:opacity-50"
        >
          <Play size={28} fill="black" className="text-black ml-1" />
        </button>
      </div>

      {/* Song List */}
      <div className="px-8">
        {songs.length === 0 ? (
          <div className="text-center py-12 text-[#b3b3b3]">
            <Heart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">Lagu yang kamu sukai akan muncul di sini</p>
            <p className="text-sm">Simpan lagu dengan mengetuk ikon hati</p>
            <Link href="/" className="mt-6 inline-block bg-white text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform">
              Cari lagu
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[#b3b3b3] text-sm border-b border-[#282828]">
                <th className="text-left py-2 px-4 w-12">#</th>
                <th className="text-left py-2">Judul</th>
                <th className="text-right py-2 px-4 w-20">
                  <Clock size={16} />
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => {
                const isCurrentSong = currentTrack?.id === song.id;
                return (
                  <tr
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className={`group hover:bg-white/10 transition-colors cursor-pointer ${isCurrentSong ? "bg-white/5" : ""}`}
                  >
                    <td className="py-3 px-4 text-[#b3b3b3] w-12">
                      <div className="flex items-center justify-center w-4">
                        <span className="group-hover:hidden">
                          {isCurrentSong && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-4">
                              <span className="w-1 bg-[#1DB954] animate-[equalizer_0.5s_ease-in-out_infinite] h-2" style={{ animationDelay: '0ms' }} />
                              <span className="w-1 bg-[#1DB954] animate-[equalizer_0.5s_ease-in-out_infinite] h-3" style={{ animationDelay: '150ms' }} />
                              <span className="w-1 bg-[#1DB954] animate-[equalizer_0.5s_ease-in-out_infinite] h-2" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : (
                            <span className={isCurrentSong ? "text-[#1DB954]" : ""}>{index + 1}</span>
                          )}
                        </span>
                        <span className="hidden group-hover:block text-white">
                          {isCurrentSong && isPlaying ? (
                            <Pause size={16} fill="white" />
                          ) : (
                            <Play size={16} fill="white" className="ml-0.5" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#282828] rounded overflow-hidden flex-shrink-0">
                          {song.cover ? (
                            <Image src={song.cover} alt={song.title} width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music size={16} className="text-[#7f7f7f]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium truncate ${isCurrentSong ? "text-[#1DB954]" : "text-white"}`}>
                            {song.title}
                          </p>
                          <p className="text-sm text-[#b3b3b3] truncate">{song.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#b3b3b3] text-right text-sm">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(song.id);
                        }}
                        className="text-[#1DB954] hover:scale-110 transition-transform"
                        title="Hapus dari favorit"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
