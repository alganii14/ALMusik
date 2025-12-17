"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { usePlayer, Track } from "./player-context";
import { ListenTogetherSession } from "@/types/listen-together";

interface ListenTogetherContextType {
  session: ListenTogetherSession | null;
  isHost: boolean;
  isInSession: boolean;
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<string | null>;
  joinSession: (sessionId: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  syncPlayState: (action: string, payload?: { track?: Track; time?: number }) => Promise<void>;
}

const ListenTogetherContext = createContext<ListenTogetherContextType | undefined>(undefined);

const SYNC_INTERVAL = 1000; // Poll every 1 second
const TIME_SYNC_THRESHOLD = 2; // Sync if time difference > 2 seconds

export function ListenTogetherProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentTrack, isPlaying, progress, play, pause, seek } = usePlayer();
  
  const [session, setSession] = useState<ListenTogetherSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const isHostRef = useRef(false);

  const isHost = session?.hostId === user?.id;
  const isInSession = !!session;

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Refs for sync to avoid stale closures
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(isPlaying);
  const progressRef = useRef(progress);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Sync state from server (for listeners - full sync including playback)
  const syncFromServer = useCallback(async () => {
    if (!session) return;

    try {
      // Add timestamp to bypass any caching
      const res = await fetch(`/api/listen-together/sync?sessionId=${session.id}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        if (res.status === 404) {
          // Session was deleted - everyone should leave
          // Stop polling
          if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
          }
          setSession(null);
          setError("Session ended");
        }
        return;
      }

      const data = await res.json();
      
      // Check if current user is still in participants list
      const stillInSession = data.participants.some((p: { id: string }) => p.id === user?.id);
      if (!stillInSession && !isHostRef.current) {
        setSession(null);
        setError("You were removed from the session");
        return;
      }
      
      // Update participants for everyone (host and listeners)
      setSession(prev => prev ? { ...prev, participants: data.participants } : null);

      // Only sync playback for non-host (listeners)
      if (!isHostRef.current && data.currentTrack) {
        const localTrack = currentTrackRef.current;
        const trackChanged = !localTrack || localTrack.id !== data.currentTrack.id;
        
        if (trackChanged) {
          console.log('[Sync] Track changed, playing:', data.currentTrack.title);
          play(data.currentTrack as Track);
        } else {
          // Same track - sync play/pause state
          if (data.isPlaying && !isPlayingRef.current) {
            play();
          } else if (!data.isPlaying && isPlayingRef.current) {
            pause();
          }

          // Sync time if difference is too large
          const timeDiff = Math.abs(progressRef.current - data.currentTime);
          if (timeDiff > TIME_SYNC_THRESHOLD) {
            seek(data.currentTime);
          }
        }
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, [session, play, pause, seek, user?.id]);

  // Start sync polling for all session members (host polls for participants, listeners poll for everything)
  useEffect(() => {
    if (session) {
      syncIntervalRef.current = setInterval(syncFromServer, SYNC_INTERVAL);
    } else if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [session, syncFromServer]);

  // Host: sync time to server periodically
  useEffect(() => {
    if (!session || !isHost || !currentTrack) return;

    const now = Date.now();
    if (now - lastSyncRef.current < 500) return; // Throttle
    lastSyncRef.current = now;

    fetch("/api/listen-together/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        userId: user?.id,
        action: "update_time",
        payload: { time: progress },
      }),
    }).catch(console.error);
  }, [progress, session, isHost, user?.id, currentTrack]);

  // Host: sync track change to server
  const currentTrackIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!session || !isHost || !currentTrack) return;
    
    // Only sync if track actually changed
    if (currentTrackIdRef.current === currentTrack.id) return;
    currentTrackIdRef.current = currentTrack.id;

    console.log('[Host] Syncing track change:', currentTrack.title);
    
    fetch("/api/listen-together/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        userId: user?.id,
        action: "change_track",
        payload: { 
          track: {
            id: currentTrack.id,
            title: currentTrack.title,
            artist: currentTrack.artist,
            imageUrl: currentTrack.imageUrl,
            audioUrl: currentTrack.audioUrl,
            duration: currentTrack.duration,
          }
        },
      }),
    })
    .then(res => {
      if (res.ok) {
        console.log('[Host] Track synced successfully');
      } else {
        console.error('[Host] Track sync failed:', res.status);
      }
    })
    .catch(console.error);
  }, [currentTrack, session, isHost, user?.id]);

  const createSession = useCallback(async (): Promise<string | null> => {
    if (!user) {
      setError("Please login to create a session");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/listen-together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: user.id,
          userName: user.name || user.email,
        }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const newSession = await res.json();
      setSession(newSession);
      return newSession.id;
    } catch (err) {
      setError("Failed to create session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const joinSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!user) {
      setError("Please login to join a session");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/listen-together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          sessionId: sessionId.toUpperCase(),
          userId: user.id,
          userName: user.name || user.email,
        }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("Session not found");
        } else {
          setError("Failed to join session");
        }
        return false;
      }

      const joinedSession = await res.json();
      setSession(joinedSession);

      // Sync to current track if exists
      if (joinedSession.currentTrack) {
        console.log('[Join] Playing track from session:', joinedSession.currentTrack.title);
        play(joinedSession.currentTrack as Track);
        if (joinedSession.currentTime > 0) {
          setTimeout(() => seek(joinedSession.currentTime), 500);
        }
        if (joinedSession.isPlaying) {
          setTimeout(() => play(), 600);
        }
      } else {
        console.log('[Join] No track in session yet');
      }

      return true;
    } catch (err) {
      setError("Failed to join session");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, play, seek]);

  const leaveSession = useCallback(async () => {
    if (!session || !user) return;

    // Stop polling immediately
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    const sessionId = session.id;
    const userId = user.id;
    const wasHost = isHostRef.current;
    
    // Clear local state first
    setSession(null);
    setError(null);

    try {
      const res = await fetch("/api/listen-together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Host uses "end" to completely end session, others use "leave"
          action: wasHost ? "end" : "leave",
          sessionId,
          userId,
        }),
      });
      
      if (!res.ok) {
        console.error("Leave session failed:", await res.text());
      }
    } catch (err) {
      console.error("Leave session error:", err);
    }
  }, [session, user]);

  const syncPlayState = useCallback(async (action: string, payload?: { track?: Track; time?: number }) => {
    if (!session || !isHost || !user) return;

    try {
      await fetch("/api/listen-together/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          userId: user.id,
          action,
          payload,
        }),
      });
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, [session, isHost, user]);

  return (
    <ListenTogetherContext.Provider
      value={{
        session,
        isHost,
        isInSession,
        isLoading,
        error,
        createSession,
        joinSession,
        leaveSession,
        syncPlayState,
      }}
    >
      {children}
    </ListenTogetherContext.Provider>
  );
}

export function useListenTogether() {
  const context = useContext(ListenTogetherContext);
  if (context === undefined) {
    throw new Error("useListenTogether must be used within a ListenTogetherProvider");
  }
  return context;
}
