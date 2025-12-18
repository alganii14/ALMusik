"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, X, Music } from "lucide-react";
import { useSongs } from "@/context/songs-context";
import { usePlayer, Track } from "@/context/player-context";

const BROWSE_CATEGORIES = [
  { id: "pop", name: "Pop", color: "#E13300", image: "/music/pop.jpg" },
  { id: "hiphop", name: "Hip-Hop", color: "#BA5D07", image: "/music/hiphop.jpg" },
  { id: "rock", name: "Rock", color: "#E8115B", image: "/music/rock.jpg" },
  { id: "indie", name: "Indie", color: "#148A08", image: "/music/indie.jpg" },
  { id: "jazz", name: "Jazz", color: "#477D95", image: "/music/jazz.jpg" },
  { id: "electronic", name: "Electronic", color: "#8D67AB", image: "/music/electronic.jpg" },
];

export default function MobileSearch() {
  const { songs } = useSongs();
  const { play, pause, isPlaying, currentTrack, setQueue } = usePlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = searchQuery.trim()
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
      play(track, "mobile-search");
    }
  };

  return (
    <div className="px-4 py-2">
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className={`flex items-center bg-white rounded-md px-3 py-2 transition-all ${
          isFocused ? "ring-2 ring-[#1db954]" : ""
        }`}>
          <Search size={20} className="text-black mr-2" />
          <input
            type="text"
            placeholder="Cari lagu atau artis"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-black placeholder-[#757575] outline-none text-sm font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-1">
              <X size={18} className="text-[#757575]" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() ? (
        <div className="space-y-2">
          {searchResults.length > 0 ? (
            <>
              <p className="text-[#b3b3b3] text-xs uppercase font-bold mb-3">
                Hasil Pencarian
              </p>
              {searchResults.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors"
                >
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
                    <p className="text-[#b3b3b3] text-xs truncate">
                      Lagu • {song.artist}
                    </p>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white font-bold mb-1">
                Tidak ada hasil untuk &quot;{searchQuery}&quot;
              </p>
              <p className="text-[#b3b3b3] text-sm">
                Coba kata kunci lain atau periksa ejaannya
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Browse Categories */
        <div>
          <h2 className="text-white text-lg font-bold mb-4">Telusuri Semua</h2>
          <div className="grid grid-cols-2 gap-3">
            {BROWSE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className="relative h-24 rounded-lg overflow-hidden"
                style={{ backgroundColor: category.color }}
              >
                <span className="absolute top-3 left-3 text-white font-bold text-base">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
