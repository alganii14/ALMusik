"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Trash2, Music, ArrowLeft, Pencil, X, Youtube, Loader2 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
  lyrics?: string;
}

interface YouTubeInfo {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  originalTitle: string;
  channelName: string;
}

export default function AdminPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [lyrics, setLyrics] = useState("");
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editLyrics, setEditLyrics] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchingLyrics, setFetchingLyrics] = useState<string | null>(null);

  // YouTube import states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytInfo, setYtInfo] = useState<YouTubeInfo | null>(null);
  const [ytTitle, setYtTitle] = useState("");
  const [ytArtist, setYtArtist] = useState("");
  const [fetchingYt, setFetchingYt] = useState(false);
  const [downloadingYt, setDownloadingYt] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "youtube">("upload");

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      const response = await fetch("/api/music");
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Get duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.floor(audio.duration));
      };
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !title || !artist) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("duration", audioDuration.toString());
    formData.append("lyrics", lyrics);
    if (coverFile) {
      formData.append("cover", coverFile);
    }

    try {
      const response = await fetch("/api/music", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setTitle("");
        setArtist("");
        setAudioFile(null);
        setCoverFile(null);
        setAudioDuration(0);
        setLyrics("");
        if (audioInputRef.current) audioInputRef.current.value = "";
        if (coverInputRef.current) coverInputRef.current.value = "";
        fetchSongs();
      } else {
        alert("Gagal upload lagu");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal upload lagu");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus lagu ini?")) return;

    try {
      const response = await fetch(`/api/music?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSongs();
      } else {
        alert("Gagal menghapus lagu");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus lagu");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEditLyrics = (song: Song) => {
    setEditingSong(song);
    setEditLyrics(song.lyrics || "");
  };

  const handleSaveLyrics = async () => {
    if (!editingSong) return;
    
    setSaving(true);
    try {
      const response = await fetch("/api/music", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSong.id, lyrics: editLyrics }),
      });

      if (response.ok) {
        setEditingSong(null);
        setEditLyrics("");
        fetchSongs();
      } else {
        alert("Gagal menyimpan lirik");
      }
    } catch (error) {
      console.error("Save lyrics error:", error);
      alert("Gagal menyimpan lirik");
    } finally {
      setSaving(false);
    }
  };

  const handleFetchLyrics = async (song: Song) => {
    setFetchingLyrics(song.id);
    try {
      const response = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id, autoFetch: true }),
      });

      const data = await response.json();

      if (response.ok && data.lyrics) {
        alert("Lirik berhasil ditemukan!");
        fetchSongs();
      } else {
        alert(data.error || "Tidak dapat menemukan lirik untuk lagu ini");
      }
    } catch (error) {
      console.error("Fetch lyrics error:", error);
      alert("Gagal mencari lirik");
    } finally {
      setFetchingLyrics(null);
    }
  };

  // YouTube functions
  const handleFetchYouTube = async () => {
    if (!youtubeUrl.trim()) {
      alert("Masukkan URL YouTube");
      return;
    }

    setFetchingYt(true);
    setYtInfo(null);

    try {
      const response = await fetch("/api/youtube/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setYtInfo(data.data);
        setYtTitle(data.data.title);
        setYtArtist(data.data.artist);
      } else {
        alert(data.error || "Gagal mendapatkan info video");
      }
    } catch (error) {
      console.error("YouTube fetch error:", error);
      alert("Gagal mendapatkan info video");
    } finally {
      setFetchingYt(false);
    }
  };

  const handleDownloadYouTube = async () => {
    if (!ytInfo) return;

    setDownloadingYt(true);

    try {
      const response = await fetch("/api/youtube/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: youtubeUrl,
          title: ytTitle,
          artist: ytArtist,
          thumbnail: ytInfo.thumbnail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Lagu berhasil ditambahkan!");
        setYoutubeUrl("");
        setYtInfo(null);
        setYtTitle("");
        setYtArtist("");
        fetchSongs();
      } else {
        alert(data.error || "Gagal mendownload lagu");
      }
    } catch (error) {
      console.error("YouTube download error:", error);
      alert("Gagal mendownload lagu");
    } finally {
      setDownloadingYt(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      {/* Edit Lyrics Modal */}
      {editingSong && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#282828]">
              <div>
                <h3 className="text-white font-semibold">Edit Lirik</h3>
                <p className="text-sm text-[#b3b3b3]">{editingSong.title} - {editingSong.artist}</p>
              </div>
              <button 
                onClick={() => setEditingSong(null)}
                className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <textarea
                value={editLyrics}
                onChange={(e) => setEditLyrics(e.target.value)}
                className="w-full h-[400px] bg-[#282828] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#1DB954] resize-none font-mono text-sm"
                placeholder="Format LRC untuk lirik sync:&#10;[00:15.00]Jadi waktu itu dingin&#10;[00:18.50]Kuberi kau hangat&#10;&#10;Atau lirik biasa tanpa timestamp"
              />
              <p className="text-xs text-[#b3b3b3] mt-2">
                Format: [mm:ss.xx]teks - contoh: [00:15.00]Jadi waktu itu dingin
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-[#282828]">
              <button
                onClick={() => setEditingSong(null)}
                className="px-4 py-2 text-[#b3b3b3] hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveLyrics}
                disabled={saving}
                className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#404040] text-black font-semibold px-6 py-2 rounded-full transition-colors"
              >
                {saving ? "Menyimpan..." : "Simpan Lirik"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 hover:bg-[#282828] rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Admin - Upload Musik</h1>
        </div>

        {/* Upload Form */}
        <div className="bg-[#181818] rounded-lg p-6 mb-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                activeTab === "upload"
                  ? "bg-[#1DB954] text-black"
                  : "bg-[#282828] text-white hover:bg-[#333]"
              }`}
            >
              <Upload size={18} />
              Upload Manual
            </button>
            <button
              onClick={() => setActiveTab("youtube")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                activeTab === "youtube"
                  ? "bg-[#FF0000] text-white"
                  : "bg-[#282828] text-white hover:bg-[#333]"
              }`}
            >
              <Youtube size={18} />
              Import dari YouTube
            </button>
          </div>

          {/* Manual Upload Tab */}
          {activeTab === "upload" && (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b3b3b3] mb-1">Judul Lagu *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#282828] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#1DB954]"
                    placeholder="Masukkan judul lagu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b3b3b3] mb-1">Artis *</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full bg-[#282828] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#1DB954]"
                    placeholder="Masukkan nama artis"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b3b3b3] mb-1">File Audio (MP3) *</label>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="w-full bg-[#282828] border border-[#404040] rounded px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#1DB954] file:text-black file:font-semibold file:cursor-pointer"
                    required
                  />
                  {audioDuration > 0 && (
                    <p className="text-xs text-[#b3b3b3] mt-1">Durasi: {formatDuration(audioDuration)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#b3b3b3] mb-1">Cover Image (opsional)</label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#282828] border border-[#404040] rounded px-3 py-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#404040] file:text-white file:cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#b3b3b3] mb-1">Lirik (opsional)</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full bg-[#282828] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#1DB954] min-h-[120px] resize-y"
                  placeholder="Format LRC untuk lirik sync:&#10;[00:15.00]Jadi waktu itu dingin&#10;[00:18.50]Kuberi kau hangat&#10;&#10;Atau lirik biasa tanpa timestamp"
                />
                <p className="text-xs text-[#b3b3b3] mt-1">
                  Gunakan format [mm:ss.xx]teks untuk lirik yang berjalan sync dengan lagu
                </p>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#404040] text-black font-semibold px-6 py-2 rounded-full transition-colors"
              >
                {uploading ? "Uploading..." : "Upload Lagu"}
              </button>
            </form>
          )}

          {/* YouTube Import Tab */}
          {activeTab === "youtube" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#b3b3b3] mb-1">URL YouTube</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1 bg-[#282828] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#FF0000]"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <button
                    onClick={handleFetchYouTube}
                    disabled={fetchingYt || !youtubeUrl.trim()}
                    className="bg-[#FF0000] hover:bg-[#cc0000] disabled:bg-[#404040] text-white font-semibold px-4 py-2 rounded transition-colors flex items-center gap-2"
                  >
                    {fetchingYt ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Youtube size={18} />
                        Cari
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* YouTube Preview */}
              {ytInfo && (
                <div className="bg-[#282828] rounded-lg p-4 space-y-4">
                  <div className="flex gap-4">
                    {ytInfo.thumbnail && (
                      <div className="w-32 h-32 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={ytInfo.thumbnail}
                          alt={ytInfo.title}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs text-[#b3b3b3] mb-1">Judul Lagu</label>
                        <input
                          type="text"
                          value={ytTitle}
                          onChange={(e) => setYtTitle(e.target.value)}
                          className="w-full bg-[#181818] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#1DB954]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#b3b3b3] mb-1">Artis</label>
                        <input
                          type="text"
                          value={ytArtist}
                          onChange={(e) => setYtArtist(e.target.value)}
                          className="w-full bg-[#181818] border border-[#404040] rounded px-3 py-2 focus:outline-none focus:border-[#1DB954]"
                        />
                      </div>
                      <p className="text-xs text-[#b3b3b3]">
                        Durasi: {formatDuration(ytInfo.duration)} • Channel: {ytInfo.channelName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadYouTube}
                    disabled={downloadingYt}
                    className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#404040] text-black font-semibold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
                  >
                    {downloadingYt ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Mendownload & Menyimpan...
                      </>
                    ) : (
                      <>
                        <Music size={20} />
                        Tambahkan ke Library
                      </>
                    )}
                  </button>
                </div>
              )}

              <p className="text-xs text-[#b3b3b3]">
                Paste link YouTube, lalu klik Cari untuk mendapatkan info lagu. Kamu bisa edit judul dan artis sebelum menambahkan.
              </p>
            </div>
          )}
        </div>

        {/* Song List */}
        <div className="bg-[#181818] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Music size={20} />
            Daftar Lagu ({songs.length})
          </h2>

          {loading ? (
            <p className="text-[#b3b3b3]">Loading...</p>
          ) : songs.length === 0 ? (
            <p className="text-[#b3b3b3]">Belum ada lagu. Upload lagu pertama kamu!</p>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-3 bg-[#282828] rounded-lg hover:bg-[#333] transition-colors"
                >
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-[#404040]">
                    {song.cover ? (
                      <Image src={song.cover} alt={song.title} width={48} height={48} className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={20} className="text-[#b3b3b3]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-[#b3b3b3] truncate">{song.artist}</p>
                  </div>
                  <span className="text-sm text-[#b3b3b3]">{formatDuration(song.duration)}</span>
                  <span className={`text-xs px-2 py-1 rounded ${song.lyrics ? "bg-[#1DB954]/20 text-[#1DB954]" : "bg-[#404040] text-[#b3b3b3]"}`}>
                    {song.lyrics ? "Lirik ✓" : "No Lirik"}
                  </span>
                  {!song.lyrics && (
                    <button
                      onClick={() => handleFetchLyrics(song)}
                      disabled={fetchingLyrics === song.id}
                      className="text-xs px-2 py-1 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#404040] text-black font-semibold rounded transition-colors"
                      title="Cari lirik otomatis"
                    >
                      {fetchingLyrics === song.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Fetch Lirik"
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleEditLyrics(song)}
                    className="p-2 text-[#b3b3b3] hover:text-[#1DB954] transition-colors"
                    title="Edit lirik"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="p-2 text-[#b3b3b3] hover:text-red-500 transition-colors"
                    title="Hapus lagu"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
