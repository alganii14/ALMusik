"use client";

import { useEffect, useCallback, useRef } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { usePlayer } from "@/context/player-context";

export default function YouTubePlayerComponent() {
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    setProgress,
    setDuration,
    volume,
    isRepeat,
    next,
    seek,
    progress,
  } = usePlayer();

  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRepeatRef = useRef(isRepeat);
  const seekingRef = useRef(false);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Handle play/pause from context
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("Play/pause error:", e);
    }
  }, [isPlaying]);

  // Handle seek from context
  useEffect(() => {
    if (!playerRef.current || seekingRef.current) return;

    const currentTime = playerRef.current.getCurrentTime?.() || 0;
    if (Math.abs(currentTime - progress) > 2) {
      seekingRef.current = true;
      playerRef.current.seekTo(progress, true);
      setTimeout(() => {
        seekingRef.current = false;
      }, 500);
    }
  }, [progress]);

  // Handle volume
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch {
        // Ignore
      }
    }
  }, [volume]);

  const startProgressTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (playerRef.current && !seekingRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          if (typeof currentTime === "number") {
            setProgress(currentTime);
          }
        } catch {
          // Player might not be ready
        }
      }
    }, 500);
  }, [setProgress]);

  const stopProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const onReady = useCallback(
    (event: YouTubeEvent) => {
      const player = event.target;
      playerRef.current = player;
      console.log("YouTube Player Ready for:", currentTrack?.title);
      player.setVolume(volume);
      player.playVideo();
    },
    [volume, currentTrack?.title]
  );

  const onStateChange = useCallback(
    (event: YouTubeEvent) => {
      const state = event.data;
      const player = event.target;

      if (state === 1) {
        // PLAYING
        setIsPlaying(true);
        const dur = player.getDuration();
        if (dur > 0) setDuration(dur);
        startProgressTracking();
      } else if (state === 2) {
        // PAUSED
        setIsPlaying(false);
        stopProgressTracking();
      } else if (state === 0) {
        // ENDED
        setIsPlaying(false);
        stopProgressTracking();
        if (isRepeatRef.current) {
          player.seekTo(0, true);
          player.playVideo();
        } else {
          next();
        }
      }
    },
    [setIsPlaying, setDuration, startProgressTracking, stopProgressTracking, next]
  );

  const onError = useCallback(
    (event: YouTubeEvent) => {
      console.error("YouTube Error:", event.data);
      stopProgressTracking();
      // Skip to next on error
      setTimeout(() => next(), 1000);
    },
    [next, stopProgressTracking]
  );

  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  if (!currentTrack?.youtubeId) {
    return null;
  }

  const opts = {
    height: "60",
    width: "80",
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 95,
        left: -9999,
        zIndex: -1,
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <YouTube
        key={currentTrack.youtubeId}
        videoId={currentTrack.youtubeId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
      />
    </div>
  );
}
