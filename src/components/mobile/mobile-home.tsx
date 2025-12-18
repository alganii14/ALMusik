"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Music, ChevronRight } from "lucide-react";
import { useSongs } from "@/context/songs-context";
import { usePlayer, Track } from "@/context/player-context";
import { useAuth } from "@/context/auth-context";

export default function MobileHome() {
  const { songs } = useSongs();
  const { user } = useAuth();
  const { play, pause, isPlaying, currentTrack, setQueue, playSource } = usePlayer();

  const trendingSongs = songs.slice(0, 10);

  // Check if playing from LT12
  const isPlayingFromLT12 = isPlaying && playSource === "lt12";

  const handlePlaySong = (song: typeof songs[0]) => {
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
      const tracks = songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        imageUrl: s.cover,
        audioUrl: s.audioUrl,
        duration: s.duration,
        lyrics: s.lyrics,
      }));
      setQueue(tracks);
      play(track, "mobile-home");
    }
  };

  const handlePlayAllLT12 = () => {
    if (songs.length === 0) return;

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

    if (isPlayingFromLT12) {
      pause();
    } else {
      play(tracks[0], "lt12");
    }
  };

  return (
    <div className="px-3 py-2 space-y-5">
      {/* LT12 Quick Access - Like Spotify */}
      <div className="grid grid-cols-2 gap-2">
        {/* LT12 Card */}
        <Link
          href="/mobile/trending"
          className="flex items-center bg-[#282828] hover:bg-[#3e3e3e] rounded overflow-hidden group transition-colors"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[10px]">LT12</span>
          </div>
          <span className="flex-1 px-2 text-white text-xs font-semibold truncate">LT12</span>
          <div className={`pr-2 transition-opacity ${isPlayingFromLT12 ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlayAllLT12(); }}
              className="w-7 h-7 bg-[#1ed760] rounded-full flex items-center justify-center shadow-lg"
            >
              {isPlayingFromLT12 ? (
                <Pause size={14} fill="black" className="text-black" />
              ) : (
                <Play size={14} fill="black" className="text-black ml-0.5" />
              )}
            </button>
          </div>
        </Link>

        {/* Liked Songs Card */}
        <Link
          href="/liked-songs"
          className="flex items-center bg-[#282828] hover:bg-[#3e3e3e] rounded overflow-hidden group transition-colors"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M1.69 2.5a4.37 4.37 0 0 1 5.61 0 4.37 4.37 0 0 1 5.61 0 4.37 4.37 0 0 1 0 5.61L8.5 13.5 4.11 8.11a4.37 4.37 0 0 1-2.42-5.61z" />
            </svg>
          </div>
          <span className="flex-1 px-2 text-white text-xs font-semibold truncate">Disukai</span>
        </Link>
      </div>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-lg font-bold">Trending Sekarang</h2>
          <Link 
            href="/mobile/trending"
            className="text-[#b3b3b3] text-sm font-medium flex items-center gap-1"
          >
            Lihat Semua <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {trendingSongs.map((song) => (
            <button
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className="flex-shrink-0 w-[140px] group"
            >
              <div className="relative w-[140px] h-[140px] rounded-lg overflow-hidden mb-2">
                {song.cover ? (
                  <Image
                    src={song.cover}
                    alt={song.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                    <Music size={40} className="text-[#7f7f7f]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center shadow-lg">
                    {currentTrack?.id === song.id && isPlaying ? (
                      <Pause size={20} fill="black" className="text-black" />
                    ) : (
                      <Play size={20} fill="black" className="text-black ml-0.5" />
                    )}
                  </div>
                </div>
              </div>
              <p className="text-white text-sm font-medium truncate">{song.title}</p>
              <p className="text-[#b3b3b3] text-xs truncate">{song.artist}</p>
            </button>
          ))}
        </div>
      </section>

      {/* For You Section */}
      <section>
        <h2 className="text-white text-lg font-bold mb-3">
          {user ? `Untuk ${user.name.split(" ")[0]}` : "Untuk Kamu"}
        </h2>
        <div className="space-y-2">
          {songs.slice(0, 5).map((song, index) => (
            <button
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors group"
            >
              <span className="w-5 text-[#b3b3b3] text-sm">{index + 1}</span>
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 relative">
                {song.cover ? (
                  <Image
                    src={song.cover}
                    alt={song.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                    <Music size={16} className="text-[#7f7f7f]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm font-medium truncate ${
                  currentTrack?.id === song.id ? "text-[#1db954]" : "text-white"
                }`}>
                  {song.title}
                </p>
                <p className="text-[#b3b3b3] text-xs truncate">{song.artist}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {currentTrack?.id === song.id && isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
