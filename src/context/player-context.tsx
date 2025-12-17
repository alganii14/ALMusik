"use client";

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode, useEffect } from "react";
import { useAuth } from "./auth-context";

const PREVIEW_DURATION = 30; // 30 seconds preview for non-logged in users

export interface Track {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  lyrics?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  isPreviewMode: boolean;
  queue: Track[];
  playSource: string | null;
  play: (track?: Track, source?: string) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (tracks: Track[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [playSource, setPlaySource] = useState<string | null>(null);

  const queueRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const isShuffleRef = useRef(false);
  const isRepeatRef = useRef(false);
  const userRef = useRef(user);
  
  // Preview mode for non-logged in users
  const isPreviewMode = !user;
  
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Clear media session to hide browser PiP controls
  const clearMediaSession = () => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      // Clear all action handlers
      const actions: MediaSessionAction[] = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'stop'];
      actions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore
        }
      });
    }
  };

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
      // Disable Picture-in-Picture and remote playback
      const audio = audioRef.current as HTMLAudioElement & { disableRemotePlayback?: boolean };
      audio.disableRemotePlayback = true;
    }
    
    clearMediaSession();

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      // Stop at 30 seconds if not logged in
      if (!userRef.current && audio.currentTime >= PREVIEW_DURATION) {
        audio.pause();
        audio.currentTime = 0;
        setProgress(0);
        setIsPlaying(false);
        playNext();
      }
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      } else {
        playNext();
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playNext = useCallback(() => {
    const currentQueue = queueRef.current;
    const current = currentTrackRef.current;

    if (!current || currentQueue.length === 0) return;

    const currentIndex = currentQueue.findIndex((t) => t.id === current.id);
    let nextIndex: number;

    if (isShuffleRef.current) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    } else {
      nextIndex = (currentIndex + 1) % currentQueue.length;
    }

    const nextTrack = currentQueue[nextIndex];
    if (nextTrack && audioRef.current) {
      setCurrentTrack(nextTrack);
      setProgress(0);
      audioRef.current.src = nextTrack.audioUrl;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const play = useCallback((track?: Track, source?: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    clearMediaSession();

    if (track) {
      setCurrentTrack(track);
      setProgress(0);
      setPlaySource(source || null);
      audio.src = track.audioUrl;
      audio.play().catch(console.error);
    } else if (currentTrackRef.current) {
      audio.play().catch(console.error);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    playNext();
  }, [playNext]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    const currentQueue = queueRef.current;
    const current = currentTrackRef.current;

    if (!current || currentQueue.length === 0 || !audio) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    const currentIndex = currentQueue.findIndex((t) => t.id === current.id);
    const prevIndex = currentIndex <= 0 ? currentQueue.length - 1 : currentIndex - 1;

    const prevTrack = currentQueue[prevIndex];
    if (prevTrack) {
      setCurrentTrack(prevTrack);
      setProgress(0);
      audio.src = prevTrack.audioUrl;
      audio.play().catch(console.error);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  const setQueue = useCallback((tracks: Track[]) => {
    setQueueState(tracks);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        isShuffle,
        isRepeat,
        isPreviewMode,
        queue,
        playSource,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
