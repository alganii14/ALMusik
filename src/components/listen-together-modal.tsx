"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListenTogether } from "@/context/listen-together-context";
import { useAuth } from "@/context/auth-context";
import { Users, Copy, Check, LogOut, Crown, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ListenTogetherModal() {
  const { user } = useAuth();
  const { session, isHost, isInSession, isLoading, error, createSession, joinSession, leaveSession } = useListenTogether();
  
  const [open, setOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");

  const handleCreate = async () => {
    const sessionId = await createSession();
    if (sessionId) {
      setMode("create");
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    const success = await joinSession(joinCode);
    if (success) {
      setJoinCode("");
    }
  };

  const handleLeave = async () => {
    await leaveSession();
    setMode("menu");
  };

  const copyCode = () => {
    if (session?.id) {
      navigator.clipboard.writeText(session.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !isInSession) {
      setMode("menu");
      setJoinCode("");
    }
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" className="text-zinc-400" disabled title="Login to use Listen Together">
        <Users className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative ${isInSession ? "text-green-500" : "text-zinc-400 hover:text-white"}`}
          title="Listen Together"
        >
          <Users className="h-5 w-5" />
          {isInSession && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Listen Together
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/20 text-red-400 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {isInSession ? (
          <SessionView 
            session={session!}
            isHost={isHost}
            copied={copied}
            onCopy={copyCode}
            onLeave={handleLeave}
          />
        ) : mode === "menu" ? (
          <MenuView 
            onCreateClick={handleCreate}
            onJoinClick={() => setMode("join")}
            isLoading={isLoading}
          />
        ) : mode === "join" ? (
          <JoinView
            joinCode={joinCode}
            onJoinCodeChange={setJoinCode}
            onJoin={handleJoin}
            onBack={() => setMode("menu")}
            isLoading={isLoading}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function MenuView({ 
  onCreateClick, 
  onJoinClick, 
  isLoading 
}: { 
  onCreateClick: () => void; 
  onJoinClick: () => void; 
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">
        Dengarkan musik bareng teman-temanmu secara real-time!
      </p>
      <div className="grid gap-3">
        <Button 
          onClick={onCreateClick} 
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Crown className="h-4 w-4 mr-2" />
          Buat Session Baru
        </Button>
        <Button 
          onClick={onJoinClick}
          variant="outline"
          className="w-full border-zinc-700 hover:bg-zinc-800"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Gabung Session
        </Button>
      </div>
    </div>
  );
}

function JoinView({
  joinCode,
  onJoinCodeChange,
  onJoin,
  onBack,
  isLoading,
}: {
  joinCode: string;
  onJoinCodeChange: (code: string) => void;
  onJoin: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-zinc-400 text-sm">
        Masukkan kode session dari temanmu
      </p>
      <Input
        placeholder="Contoh: ABC123"
        value={joinCode}
        onChange={(e) => onJoinCodeChange(e.target.value.toUpperCase())}
        className="bg-zinc-800 border-zinc-700 text-center text-lg tracking-widest uppercase"
        maxLength={6}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1 border-zinc-700">
          Kembali
        </Button>
        <Button 
          onClick={onJoin} 
          disabled={isLoading || joinCode.length < 6}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "Joining..." : "Gabung"}
        </Button>
      </div>
    </div>
  );
}

function SessionView({
  session,
  isHost,
  copied,
  onCopy,
  onLeave,
}: {
  session: { id: string; participants: { id: string; name: string; isHost: boolean }[] };
  isHost: boolean;
  copied: boolean;
  onCopy: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Session Code */}
      <div className="bg-zinc-800 rounded-lg p-4 text-center">
        <p className="text-zinc-400 text-xs mb-1">Kode Session</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold tracking-widest text-green-500">
            {session.id}
          </span>
          <Button variant="ghost" size="icon" onClick={onCopy} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-zinc-500 text-xs mt-2">
          Bagikan kode ini ke temanmu untuk bergabung
        </p>
      </div>

      {/* Participants */}
      <div>
        <p className="text-zinc-400 text-sm mb-2">
          Peserta ({session.participants.length})
        </p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {session.participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-zinc-700 text-xs">
                  {p.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm truncate">{p.name}</span>
              {p.isHost && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="text-center text-sm text-zinc-400">
        {isHost ? (
          <p>Kamu adalah host. Kontrol musik akan disinkronkan ke semua peserta.</p>
        ) : (
          <p>Musik akan otomatis tersinkronisasi dengan host.</p>
        )}
      </div>

      {/* Leave Button */}
      <Button 
        variant="destructive" 
        onClick={onLeave}
        className="w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isHost ? "Akhiri Session" : "Keluar Session"}
      </Button>
    </div>
  );
}
