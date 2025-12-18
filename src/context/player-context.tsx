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

export interface AudioEnhancement {
  bass: number; // -12 to 12 dB
  mid: number; // -12 to 12 dB
  treble: number; // -12 to 12 dB
  preset: AudioPreset;
  spatialAudio: boolean;
  normalizer: boolean;
}

export type AudioPreset = "flat" | "bass_boost" | "vocal" | "electronic" | "rock" | "jazz" | "classical" | "custom";

const AUDIO_PRESETS: Record<AudioPreset, { bass: number; mid: number; treble: number }> = {
  flat: { bass: 0, mid: 0, treble: 0 },
  bass_boost: { bass: 8, mid: 0, treble: 2 },
  vocal: { bass: -2, mid: 4, treble: 2 },
  electronic: { bass: 6, mid: -2, treble: 4 },
  rock: { bass: 4, mid: 2, treble: 4 },
  jazz: { bass: 2, mid: 0, treble: 4 },
  classical: { bass: 0, mid: 2, treble: 4 },
  custom: { bass: 0, mid: 0, treble: 0 },
};

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
  audioEnhancement: AudioEnhancement;
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
  setAudioEnhancement: (enhancement: Partial<AudioEnhancement>) => void;
  setAudioPreset: (preset: AudioPreset) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [playSource, setPlaySource] = useState<string | null>(null);
  const [audioEnhancement, setAudioEnhancementState] = useState<AudioEnhancement>({
    bass: 0,
    mid: 0,
    treble: 0,
    preset: "flat",
    spatialAudio: false,
    normalizer: false,
  });

  const queueRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const isShuffleRef = useRef(false);
  const isRepeatRef = useRef(false);
  const userRef = useRef(user);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const audioEnhancementRef = useRef(audioEnhancement);
  
  // Preview mode for non-logged in users
  const isPreviewMode = !user;

  // Update enhancement ref
  useEffect(() => {
    audioEnhancementRef.current = audioEnhancement;
  }, [audioEnhancement]);

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

  // Initialize Web Audio API for audio enhancement
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      const ctx = audioContextRef.current;

      // Create source from audio element
      sourceNodeRef.current = ctx.createMediaElementSource(audioRef.current);

      // Create EQ filters
      // Bass filter (low shelf)
      bassFilterRef.current = ctx.createBiquadFilter();
      bassFilterRef.current.type = "lowshelf";
      bassFilterRef.current.frequency.value = 200;
      bassFilterRef.current.gain.value = audioEnhancementRef.current.bass;

      // Mid filter (peaking)
      midFilterRef.current = ctx.createBiquadFilter();
      midFilterRef.current.type = "peaking";
      midFilterRef.current.frequency.value = 1000;
      midFilterRef.current.Q.value = 1;
      midFilterRef.current.gain.value = audioEnhancementRef.current.mid;

      // Treble filter (high shelf)
      trebleFilterRef.current = ctx.createBiquadFilter();
      trebleFilterRef.current.type = "highshelf";
      trebleFilterRef.current.frequency.value = 4000;
      trebleFilterRef.current.gain.value = audioEnhancementRef.current.treble;

      // Compressor for normalizer
      compressorRef.current = ctx.createDynamicsCompressor();
      compressorRef.current.threshold.value = -24;
      compressorRef.current.knee.value = 30;
      compressorRef.current.ratio.value = 12;
      compressorRef.current.attack.value = 0.003;
      compressorRef.current.release.value = 0.25;

      // Stereo panner for spatial audio
      pannerRef.current = ctx.createStereoPanner();
      pannerRef.current.pan.value = 0;

      // Gain node
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = 1;

      // Connect nodes: source -> bass -> mid -> treble -> compressor -> panner -> gain -> destination
      sourceNodeRef.current.connect(bassFilterRef.current);
      bassFilterRef.current.connect(midFilterRef.current);
      midFilterRef.current.connect(trebleFilterRef.current);
      trebleFilterRef.current.connect(compressorRef.current);
      compressorRef.current.connect(pannerRef.current);
      pannerRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
    } catch (error) {
      console.error("Failed to initialize Web Audio API:", error);
    }
  }, []);

  // Update EQ values
  useEffect(() => {
    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = audioEnhancement.bass;
    }
    if (midFilterRef.current) {
      midFilterRef.current.gain.value = audioEnhancement.mid;
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = audioEnhancement.treble;
    }
    if (compressorRef.current) {
      // Enable/disable normalizer by adjusting threshold
      compressorRef.current.threshold.value = audioEnhancement.normalizer ? -24 : 0;
    }
  }, [audioEnhancement.bass, audioEnhancement.mid, audioEnhancement.treble, audioEnhancement.normalizer]);

  // Spatial audio effect (subtle stereo widening)
  useEffect(() => {
    if (!pannerRef.current || !audioContextRef.current) return;
    
    if (audioEnhancement.spatialAudio) {
      // Create subtle stereo movement
      let animationId: number;
      let phase = 0;
      const animate = () => {
        if (pannerRef.current && audioEnhancementRef.current.spatialAudio) {
          phase += 0.02;
          pannerRef.current.pan.value = Math.sin(phase) * 0.15; // Subtle pan
          animationId = requestAnimationFrame(animate);
        }
      };
      animate();
      return () => cancelAnimationFrame(animationId);
    } else {
      pannerRef.current.pan.value = 0;
    }
  }, [audioEnhancement.spatialAudio]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
      audioRef.current.crossOrigin = "anonymous"; // Required for Web Audio API
      const audio = audioRef.current as HTMLAudioElement & { disableRemotePlayback?: boolean };
      audio.disableRemotePlayback = true;
    }
    
    clearMediaSession();

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
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

  // Safe play to avoid AbortError
  const safePlay = useCallback(async (audio: HTMLAudioElement) => {
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Ignore
      }
    }
    playPromiseRef.current = audio.play();
    try {
      await playPromiseRef.current;
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Play error:', e);
      }
    }
    playPromiseRef.current = null;
  }, []);

  const safePause = useCallback(async (audio: HTMLAudioElement) => {
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Ignore
      }
      playPromiseRef.current = null;
    }
    audio.pause();
  }, []);


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
      safePlay(audioRef.current);
    }
  }, [safePlay]);

  const play = useCallback((track?: Track, source?: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    clearMediaSession();

    // Initialize audio context on first play (requires user interaction)
    if (!audioContextRef.current) {
      initAudioContext();
    }

    // Resume audio context if suspended
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (track) {
      setCurrentTrack(track);
      setProgress(0);
      setPlaySource(source || null);
      audio.src = track.audioUrl;
      safePlay(audio);
    } else if (currentTrackRef.current) {
      safePlay(audio);
    }
  }, [safePlay, initAudioContext]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      safePause(audioRef.current);
    }
  }, [safePause]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      safePlay(audio);
    } else {
      safePause(audio);
    }
  }, [safePlay, safePause]);

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
      safePlay(audio);
    }
  }, [safePlay]);

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

  const setAudioEnhancement = useCallback((enhancement: Partial<AudioEnhancement>) => {
    setAudioEnhancementState((prev) => {
      const newState = { ...prev, ...enhancement };
      // If manually changing EQ, set preset to custom
      if (enhancement.bass !== undefined || enhancement.mid !== undefined || enhancement.treble !== undefined) {
        if (enhancement.preset === undefined) {
          newState.preset = "custom";
        }
      }
      return newState;
    });
  }, []);

  const setAudioPreset = useCallback((preset: AudioPreset) => {
    const presetValues = AUDIO_PRESETS[preset];
    setAudioEnhancementState((prev) => ({
      ...prev,
      ...presetValues,
      preset,
    }));
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
        audioEnhancement,
        setAudioEnhancement,
        setAudioPreset,
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
