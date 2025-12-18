"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Play, Pause, Music, Shuffle } from "lucide-react";
import { useSongs } from "@/context/songs-context";
import { usePlayer, Track } from "@/context/player-context";

export default function MobileTrendingPage() {
  const router = useRouter();
  const { songs } = useSongs();
  const { play, pause, isPlaying, currentTrack, setQueue } = usePlayer();

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
      play(track, "mobile-trending");
    }
  };

  const handlePlayAll = () => {
    if (songs.length === 0) return;
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
    play(tracks[0], "mobile-trending");
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    const tracks = songs.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      imageUrl: s.cover,
      audioUrl: s.audioUrl,
      duration: s.duration,
      lyrics: s.lyrics,
    }));
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    play(shuffled[0], "mobile-trending");
  };

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto pb-[140px]">
      {/* Header with gradient */}
      <div className="bg-gradient-to-b from-[#5c3d6e] to-[#121212] pb-6">
        <header className="sticky top-0 z-50 px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white">
            <ChevronLeft size={28} />
          </button>
        </header>

        {/* Playlist Info */}
        <div className="px-4 pt-4">
          <div className="w-40 h-40 mx-auto bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg shadow-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-4xl">LT12</span>
          </div>
          <h1 className="text-white text-2xl font-bold text-center">Trending Sekarang</h1>
          <p className="text-[#b3b3b3] text-sm text-center mt-1">
            {songs.length} lagu • ALMusik
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6 px-4">
          <button
            onClick={handleShufflePlay}
            className="flex items-center gap-2 bg-transparent border border-[#b3b3b3] text-white px-6 py-2 rounded-full hover:border-white transition-colors"
          >
            <Shuffle size={18} />
            <span className="font-medium">Acak</span>
          </button>
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 bg-[#1DB954] text-black px-8 py-2 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            <Play size={20} fill="currentColor" />
            <span className="font-bold">Putar</span>
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="px-4 py-4">
        {songs.map((song, index) => (
          <button
            key={song.id}
            onClick={() => handlePlaySong(song)}
            className="w-full flex items-center gap-3 py-3 hover:bg-[#282828] rounded-lg transition-colors group"
          >
            <span className="w-6 text-[#b3b3b3] text-sm text-center">
              {currentTrack?.id === song.id && isPlaying ? (
                <div className="flex items-center justify-center gap-0.5">
                  <span className="w-0.5 h-3 bg-[#1db954] animate-pulse" />
                  <span className="w-0.5 h-4 bg-[#1db954] animate-pulse delay-75" />
                  <span className="w-0.5 h-2 bg-[#1db954] animate-pulse delay-150" />
                </div>
              ) : (
                index + 1
              )}
            </span>
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
            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
              {currentTrack?.id === song.id && isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="text-white" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
