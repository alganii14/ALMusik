import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { Audio } from "expo-av";

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  audioUrl?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  queue: Track[];
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Setup audio mode on mount - dengan delay untuk menghindari crash
  useEffect(() => {
    let isMounted = true;
    
    const setupAudio = async () => {
      // Delay sedikit untuk memastikan native module sudah ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isMounted) return;
      
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log("Audio mode setup complete");
      } catch (error) {
        console.error("Error setting audio mode:", error);
      }
    };
    
    setupAudio();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const playTrack = async (track: Track) => {
    try {
      setIsLoading(true);
      
      // Stop current track
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setCurrentTrack(track);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);

      if (track.audioUrl) {
        console.log("Loading audio from:", track.audioUrl);
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } else {
        console.warn("No audioUrl provided for track:", track.title);
      }
    } catch (error) {
      console.error("Error playing track:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        playNext();
      }
    }
  };

  const togglePlay = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const seekTo = async (pos: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(pos);
  };

  const playNext = async () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      await playTrack(nextTrack);
    }
  };

  const playPrevious = async () => {
    if (position > 3000 && soundRef.current) {
      await soundRef.current.setPositionAsync(0);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue([...queue, track]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        duration,
        position,
        queue,
        playTrack,
        togglePlay,
        seekTo,
        playNext,
        playPrevious,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
