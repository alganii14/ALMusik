"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Music, Trash2, Clock, Users, Copy, Check, UserMinus, Crown } from "lucide-react";
import { usePlayer, Track } from "@/context/player-context";
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

interface CollabSong {
  id: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
}

interface Collaborator {
  userId: string;
  userName: string;
  joinedAt: string;
  role: "owner" | "editor";
}

interface CollaborativePlaylist {
  id: string;
  name: string;
  description: string;
  cover: string;
  ownerId: string;
  ownerName: string;
  collaborators: Collaborator[];
  songs: CollabSong[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export default function CollaborativePlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { play, pause, currentTrack, isPlaying, setQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<CollaborativePlaylist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [id, user]);

  async function fetchData() {
    if (!user) return;
    try {
      const [playlistRes, songsRes] = await Promise.all([
        fetch(`/api/collaborative-playlist?id=${id}`),
        fetch("/api/music"),
      ]);

      const playlistData = await playlistRes.json();
      const songsData = await songsRes.json();

      if (playlistData.playlist) {
        setPlaylist(playlistData.playlist);
        const songIds = playlistData.playlist.songs.map((s: CollabSong) => s.id);
        const playlistSongs = (songsData.songs || []).filter((s: Song) => songIds.includes(s.id));
        setSongs(playlistSongs);
      }
      setAllSongs(songsData.songs || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSong(songId: string) {
    if (!user || !playlist) return;
    try {
      await fetch("/api/collaborative-playlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playlist.id,
          action: "addSong",
          songId,
          userId: user.id,
          userName: user.name,
        }),
      });
      setShowAddSong(false);
      fetchData();
    } catch (error) {
      console.error("Failed to add song:", error);
    }
  }

  async function handleRemoveSong(songId: string) {
    if (!user || !playlist) return;
    try {
      await fetch("/api/collaborative-playlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playlist.id,
          action: "removeSong",
          songId,
          userId: user.id,
          userName: user.name,
        }),
      });
      fetchData();
    } catch (error) {
      console.error("Failed to remove song:", error);
    }
  }

  async function handleLeavePlaylist() {
    if (!user || !playlist) return;
    if (!confirm("Yakin ingin keluar dari playlist ini?")) return;
    try {
      await fetch("/api/collaborative-playlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playlist.id,
          action: "leave",
          userId: user.id,
        }),
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to leave playlist:", error);
    }
  }

  function copyInviteLink() {
    if (!playlist) return;
    const link = `${window.location.origin}/collaborative-playlist/join?code=${playlist.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }


  function handlePlayAll() {
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
    play(tracks[0]);
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

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getSongAddedBy(songId: string): string {
    const collabSong = playlist?.songs.find((s) => s.id === songId);
    return collabSong?.addedByName || "Unknown";
  }

  const isOwner = playlist?.ownerId === user?.id;
  const isCollaborator = playlist?.collaborators.some((c) => c.userId === user?.id);
  const availableSongs = allSongs.filter((s) => !playlist?.songs.some((ps) => ps.id === s.id));

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
        <p className="mb-4">Silakan login untuk melihat playlist</p>
        <Link href="/login" className="text-[#1DB954] hover:underline">Login</Link>
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

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
        <p className="mb-4">Playlist tidak ditemukan</p>
        <Link href="/" className="text-[#1DB954] hover:underline">Kembali ke beranda</Link>
      </div>
    );
  }

  if (!isCollaborator) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center">
        <p className="mb-4">Anda tidak memiliki akses ke playlist ini</p>
        <Link href="/" className="text-[#1DB954] hover:underline">Kembali ke beranda</Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#121212] text-white pb-32">
      {/* Header */}
      <div className="pt-20 px-8 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[#b3b3b3] hover:text-white mb-6">
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </Link>

        <div className="flex items-end gap-6">
          <div className="w-48 h-48 bg-[#282828] rounded shadow-2xl flex items-center justify-center flex-shrink-0 relative">
            {songs.length > 0 && songs[0].cover ? (
              <Image src={songs[0].cover} alt={playlist.name} width={192} height={192} className="rounded object-cover" unoptimized />
            ) : (
              <Music size={64} className="text-[#7f7f7f]" />
            )}
            <div className="absolute -bottom-2 -right-2 bg-[#1DB954] rounded-full p-2">
              <Users size={20} className="text-black" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium bg-[#1DB954]/20 text-[#1DB954] px-2 py-0.5 rounded">
                Collaborative Playlist
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
            <p className="text-[#b3b3b3] text-sm mb-2">{playlist.description}</p>
            <div className="flex items-center gap-2 text-sm text-[#b3b3b3]">
              <span>Dibuat oleh {playlist.ownerName}</span>
              <span>•</span>
              <span>{playlist.collaborators.length} kolaborator</span>
              <span>•</span>
              <span>{songs.length} lagu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 py-4 flex items-center gap-4 flex-wrap">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] transition-transform disabled:opacity-50"
        >
          <Play size={28} fill="black" className="text-black ml-1" />
        </button>
        <button
          onClick={() => setShowAddSong(true)}
          className="text-[#b3b3b3] hover:text-white font-bold"
        >
          + Tambah Lagu
        </button>
        <button
          onClick={() => setShowCollaborators(true)}
          className="flex items-center gap-2 text-[#b3b3b3] hover:text-white"
        >
          <Users size={20} />
          <span>{playlist.collaborators.length}</span>
        </button>
        <button
          onClick={copyInviteLink}
          className="flex items-center gap-2 bg-[#282828] hover:bg-[#3e3e3e] px-4 py-2 rounded-full text-sm transition-colors"
        >
          {copied ? <Check size={16} className="text-[#1DB954]" /> : <Copy size={16} />}
          <span>{copied ? "Tersalin!" : "Salin Link Undangan"}</span>
        </button>
        {!isOwner && (
          <button
            onClick={handleLeavePlaylist}
            className="flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <UserMinus size={20} />
            <span>Keluar</span>
          </button>
        )}
      </div>


      {/* Song List */}
      <div className="px-8">
        {songs.length === 0 ? (
          <div className="text-center py-12 text-[#b3b3b3]">
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            <p>Playlist ini masih kosong</p>
            <button onClick={() => setShowAddSong(true)} className="mt-4 text-white hover:underline">
              Tambah lagu sekarang
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[#b3b3b3] text-sm border-b border-[#282828]">
                <th className="text-left py-2 px-4 w-12">#</th>
                <th className="text-left py-2">Judul</th>
                <th className="text-left py-2 hidden md:table-cell">Ditambahkan oleh</th>
                <th className="text-right py-2 px-4 w-20"><Clock size={16} /></th>
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
                              <span className="w-1 bg-[#1DB954] animate-[equalizer_0.5s_ease-in-out_infinite] h-2" />
                              <span className="w-1 bg-[#1DB954] animate-[equalizer_0.5s_ease-in-out_infinite] h-3" style={{ animationDelay: "150ms" }} />
                              <span className="w-1 bg-[#1DB954] animate-[equalizer_0.5s_ease-in-out_infinite] h-2" style={{ animationDelay: "300ms" }} />
                            </div>
                          ) : (
                            <span className={isCurrentSong ? "text-[#1DB954]" : ""}>{index + 1}</span>
                          )}
                        </span>
                        <span className="hidden group-hover:block text-white">
                          {isCurrentSong && isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#282828] rounded overflow-hidden flex-shrink-0">
                          {song.cover ? (
                            <Image src={song.cover} alt={song.title} width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Music size={16} className="text-[#7f7f7f]" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium truncate ${isCurrentSong ? "text-[#1DB954]" : "text-white"}`}>{song.title}</p>
                          <p className="text-sm text-[#b3b3b3] truncate">{song.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#b3b3b3] text-sm hidden md:table-cell">{getSongAddedBy(song.id)}</td>
                    <td className="py-3 px-4 text-[#b3b3b3] text-right text-sm">{formatDuration(song.duration)}</td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); }}
                        className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-red-500 transition-all"
                        title="Hapus dari playlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>


      {/* Add Song Modal */}
      {showAddSong && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
          <div className="bg-[#282828] rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#404040]">
              <h2 className="text-white text-lg font-bold">Tambah Lagu ke Playlist</h2>
              <button onClick={() => setShowAddSong(false)} className="text-[#b3b3b3] hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {availableSongs.length === 0 ? (
                <p className="text-[#b3b3b3] text-center py-8">Semua lagu sudah ada di playlist ini</p>
              ) : (
                <div className="space-y-2">
                  {availableSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-[#3e3e3e] cursor-pointer"
                      onClick={() => handleAddSong(song.id)}
                    >
                      <div className="w-10 h-10 bg-[#404040] rounded overflow-hidden flex-shrink-0">
                        {song.cover ? (
                          <Image src={song.cover} alt={song.title} width={40} height={40} className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Music size={16} className="text-[#7f7f7f]" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-sm text-[#b3b3b3] truncate">{song.artist}</p>
                      </div>
                      <span className="text-[#1DB954] text-sm font-bold">+ Tambah</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collaborators Modal */}
      {showCollaborators && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
          <div className="bg-[#282828] rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#404040]">
              <h2 className="text-white text-lg font-bold">Kolaborator ({playlist.collaborators.length})</h2>
              <button onClick={() => setShowCollaborators(false)} className="text-[#b3b3b3] hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {playlist.collaborators.map((collab) => (
                <div key={collab.userId} className="flex items-center gap-3 p-2 rounded bg-[#3e3e3e]/50">
                  <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center text-black font-bold">
                    {collab.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{collab.userName}</p>
                      {collab.role === "owner" && <Crown size={14} className="text-yellow-500" />}
                    </div>
                    <p className="text-xs text-[#b3b3b3]">
                      {collab.role === "owner" ? "Pemilik" : "Editor"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#404040]">
              <p className="text-sm text-[#b3b3b3] mb-2">Undang teman dengan kode:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#404040] px-3 py-2 rounded text-white font-mono">{playlist.inviteCode}</code>
                <button onClick={copyInviteLink} className="bg-[#1DB954] text-black px-4 py-2 rounded font-bold hover:bg-[#1ed760]">
                  {copied ? "Tersalin!" : "Salin Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
