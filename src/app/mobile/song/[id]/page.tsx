"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Play,
  Pause,
  Heart,
  Share2,
  MoreHorizontal,
  Music,
  Plus,
  ListMusic,
} from "lucide-react";
import { useSongs, Song } from "@/context/songs-context";
import { usePlayer, Track } from "@/context/player-context";
import { useFavorites } from "@/context/favorites-context";

export default function MobileSongPage() {
  const params = useParams();
  const router = useRouter();
  const { songs } = useSongs();
  const { play, pause, isPlaying, currentTrack, setQueue } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [song, setSong] = useState<Song | null>(null);

  const songId = params.id as string;
  const isLiked = song ? isFavorite(song.id) : false;
  const isCurrentSong = currentTrack?.id === songId;

  useEffect(() => {
    const foundSong = songs.find((s) => s.id === songId);
    setSong(foundSong || null);
  }, [songId, songs]);

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

    if (isCurrentSong && isPlaying) {
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
      play(track, "mobile-song");
    }
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-[#121212] max-w-md mx-auto flex items-center justify-center">
        <p className="text-[#b3b3b3]">Lagu tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto pb-[140px]">
      {/* Header with gradient */}
      <div className="bg-gradient-to-b from-[#5c3d6e] to-[#121212] pb-6">
        <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white">
            <ChevronLeft size={28} />
          </button>
          <button className="text-white">
            <MoreHorizontal size={24} />
          </button>
        </header>

        {/* Song Cover */}
        <div className="px-8 pt-4">
          <div className="w-full aspect-square max-w-[280px] mx-auto rounded-lg shadow-2xl overflow-hidden">
            {song.cover ? (
              <Image
                src={song.cover}
                alt={song.title}
                width={280}
                height={280}
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

        {/* Song Info */}
        <div className="px-6 pt-6">
          <h1 className="text-white text-2xl font-bold">{song.title}</h1>
          <p className="text-[#b3b3b3] text-base mt-1">{song.artist}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-6 mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleFavorite(song.id)}
              className={`p-2 ${isLiked ? "text-[#1db954]" : "text-[#b3b3b3]"}`}
            >
              <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="p-2 text-[#b3b3b3]">
              <Plus size={28} />
            </button>
            <button className="p-2 text-[#b3b3b3]">
              <Share2 size={24} />
            </button>
          </div>
          <button
            onClick={handlePlay}
            className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg"
          >
            {isCurrentSong && isPlaying ? (
              <Pause size={28} fill="black" className="text-black" />
            ) : (
              <Play size={28} fill="black" className="text-black ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Lyrics Section */}
      {song.lyrics && (
        <div className="px-6 py-6">
          <h2 className="text-white text-lg font-bold mb-4">Lirik</h2>
          <div className="bg-[#282828] rounded-lg p-4">
            <p className="text-[#b3b3b3] text-sm whitespace-pre-line leading-relaxed">
              {song.lyrics.split("\n").slice(0, 8).join("\n")}
              {song.lyrics.split("\n").length > 8 && "..."}
            </p>
            {song.lyrics.split("\n").length > 8 && (
              <button className="text-white text-sm font-bold mt-4">
                Lihat Selengkapnya
              </button>
            )}
          </div>
        </div>
      )}

      {/* Related Songs */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Lagu Serupa</h2>
          <ListMusic size={20} className="text-[#b3b3b3]" />
        </div>
        <div className="space-y-2">
          {songs
            .filter((s) => s.id !== song.id)
            .slice(0, 5)
            .map((relatedSong) => (
              <button
                key={relatedSong.id}
                onClick={() => router.push(`/mobile/song/${relatedSong.id}`)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors"
              >
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 relative">
                  {relatedSong.cover ? (
                    <Image
                      src={relatedSong.cover}
                      alt={relatedSong.title}
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
                  <p className="text-white text-sm font-medium truncate">
                    {relatedSong.title}
                  </p>
                  <p className="text-[#b3b3b3] text-xs truncate">
                    {relatedSong.artist}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
