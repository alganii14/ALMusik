"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  duration: number;
  lyrics?: string;
}

interface SongsContextType {
  songs: Song[];
  isLoading: boolean;
  refreshSongs: () => Promise<void>;
  lastUpdated: number;
}

const SongsContext = createContext<SongsContextType | undefined>(undefined);

export function SongsProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const refreshSongs = useCallback(async () => {
    try {
      const response = await fetch("/api/music?t=" + Date.now());
      const data = await response.json();
      setSongs(data.songs || []);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refreshSongs();
  }, [refreshSongs]);

  // Poll for updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSongs();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshSongs]);

  return (
    <SongsContext.Provider value={{ songs, isLoading, refreshSongs, lastUpdated }}>
      {children}
    </SongsContext.Provider>
  );
}

export function useSongs() {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error("useSongs must be used within a SongsProvider");
  }
  return context;
}
