"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  uri: string;
  duration: number;
}

interface SpotifyPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  isReady: boolean;
  isConnected: boolean;
  deviceId: string | null;
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (tracks: Track[]) => void;
  connectSpotify: () => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);

  // Check for existing token on mount
  useEffect(() => {
    async function checkToken() {
      try {
        const response = await fetch("/api/spotify/token");
        const data = await response.json();
        if (data.access_token) {
          setAccessToken(data.access_token);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to check token:", error);
      }
    }
    checkToken();
  }, []);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "ALMusik Web Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: volume / 100,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spotify Player Ready with Device ID:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline:", device_id);
        setIsReady(false);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        const track = state.track_window.current_track;
        if (track) {
          setCurrentTrack({
            id: track.id || "",
            title: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            imageUrl: track.album.images[0]?.url || "",
            uri: track.uri,
            duration: track.duration_ms / 1000,
          });
          setDuration(track.duration_ms / 1000);
        }

        setIsPlaying(!state.paused);
        setProgress(state.position / 1000);
        setIsShuffle(state.shuffle);
        setIsRepeat(state.repeat_mode !== 0);
      });

      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Authentication error:", message);
        setIsConnected(false);
        setAccessToken(null);
      });

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  // Progress update interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= duration) return 0;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const connectSpotify = useCallback(() => {
    window.location.href = "/api/spotify/auth";
  }, []);

  const play = useCallback(async (track?: Track) => {
    if (!accessToken || !deviceId) {
      console.warn("Not connected to Spotify");
      return;
    }

    try {
      if (track) {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [track.uri],
          }),
        });
      } else {
        await player?.resume();
      }
    } catch (error) {
      console.error("Play error:", error);
    }
  }, [accessToken, deviceId, player]);

  const pause = useCallback(async () => {
    await player?.pause();
  }, [player]);

  const togglePlay = useCallback(async () => {
    await player?.togglePlay();
  }, [player]);

  const next = useCallback(async () => {
    await player?.nextTrack();
  }, [player]);

  const previous = useCallback(async () => {
    await player?.previousTrack();
  }, [player]);

  const seek = useCallback(async (time: number) => {
    await player?.seek(time * 1000);
    setProgress(time);
  }, [player]);

  const setVolume = useCallback(async (vol: number) => {
    setVolumeState(vol);
    await player?.setVolume(vol / 100);
  }, [player]);

  const toggleShuffle = useCallback(async () => {
    if (!accessToken) return;
    const newShuffle = !isShuffle;
    await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${newShuffle}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setIsShuffle(newShuffle);
  }, [accessToken, isShuffle]);

  const toggleRepeat = useCallback(async () => {
    if (!accessToken) return;
    const newRepeat = isRepeat ? "off" : "track";
    await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${newRepeat}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setIsRepeat(!isRepeat);
  }, [accessToken, isRepeat]);

  const setQueue = useCallback((tracks: Track[]) => {
    setQueueState(tracks);
  }, []);

  return (
    <SpotifyPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        isShuffle,
        isRepeat,
        queue,
        isReady,
        isConnected,
        deviceId,
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
        connectSpotify,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayer() {
  const context = useContext(SpotifyPlayerContext);
  if (context === undefined) {
    throw new Error("useSpotifyPlayer must be used within a SpotifyPlayerProvider");
  }
  return context;
}
