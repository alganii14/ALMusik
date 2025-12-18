"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoJoining, setAutoJoining] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setInviteCode(code);
      if (user) {
        handleJoinWithCode(code);
      }
    }
  }, [searchParams, user]);

  async function handleJoinWithCode(code: string) {
    if (!user || !code.trim()) return;

    setLoading(true);
    setAutoJoining(true);
    setError("");

    try {
      const response = await fetch("/api/collaborative-playlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          inviteCode: code.trim().toUpperCase(),
          userId: user.id,
          userName: user.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal bergabung ke playlist");
        setAutoJoining(false);
        return;
      }

      router.push(`/collaborative-playlist/${data.playlist.id}`);
    } catch (err) {
      console.error("Join error:", err);
      setError("Terjadi kesalahan. Coba lagi.");
      setAutoJoining(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleJoinWithCode(inviteCode);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#282828] rounded-xl p-8 max-w-md w-full text-center">
          <Users size={48} className="mx-auto mb-4 text-[#1DB954]" />
          <h1 className="text-2xl font-bold mb-2">Bergabung ke Playlist</h1>
          <p className="text-[#b3b3b3] mb-6">Silakan login terlebih dahulu untuk bergabung ke collaborative playlist</p>
          <Link
            href={`/login?redirect=${encodeURIComponent(`/collaborative-playlist/join?code=${inviteCode}`)}`}
            className="inline-block bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (autoJoining) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="animate-spin text-[#1DB954] mb-4" />
        <p>Bergabung ke playlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#282828] rounded-xl p-8 max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-[#b3b3b3] hover:text-white mb-6">
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1DB954]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-[#1DB954]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bergabung ke Playlist</h1>
          <p className="text-[#b3b3b3]">Masukkan kode undangan untuk bergabung ke collaborative playlist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#b3b3b3] mb-2">Kode Undangan</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Contoh: ABC123"
              className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder:text-[#727272] text-center text-xl tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={!inviteCode.trim() || loading}
            className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:bg-[#1ed760] disabled:opacity-50 disabled:hover:bg-[#1DB954] transition-colors"
          >
            {loading ? "Bergabung..." : "Bergabung"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinPlaylistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#1DB954]" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
