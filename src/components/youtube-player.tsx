"use client";

import { useEffect, useCallback, useRef, useState, Component, ReactNode } from "react";
import { usePlayer } from "@/context/player-context";

// Error Boundary to catch YouTube player errors
class YouTubeErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("YouTube Player Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Inner component that uses YouTube
function YouTubePlayerInner() {
  const {
    currentTrack,
    isPlaying,
    setIsPlaying,
    setProgress,
    setDuration,
    volume,
    isRepeat,
    next,
    progress,
  } = usePlayer();

  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRepeatRef = useRef(isRepeat);
  const seekingRef = useRef(false);
  const [YouTube, setYouTube] = useState<typeof import("react-youtube").default | null>(null);

  // Dynamically import react-youtube only on client
  useEffect(() => {
    import("react-youtube").then((mod) => {
      setYouTube(() => mod.default);
    }).catch((err) => {
      console.error("Failed to load react-youtube:", err);
    });
  }, []);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Handle play/pause from context
  useEffect(() => {
    if (!playerRef.current || !currentTrack?.youtubeId) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("Play/pause error:", e);
    }
  }, [isPlaying, currentTrack?.youtubeId]);

  // Handle seek from context - only for YouTube tracks
  useEffect(() => {
    if (!playerRef.current || seekingRef.current || !currentTrack?.youtubeId) return;

    try {
      const currentTime = playerRef.current.getCurrentTime?.() || 0;
      if (Math.abs(currentTime - progress) > 2) {
        seekingRef.current = true;
        playerRef.current.seekTo(progress, true);
        setTimeout(() => {
          seekingRef.current = false;
        }, 500);
      }
    } catch {
      // Ignore seek errors
    }
  }, [progress, currentTrack?.youtubeId]);

  // Handle volume
  useEffect(() => {
    if (playerRef.current && currentTrack?.youtubeId) {
      try {
        playerRef.current.setVolume(volume);
      } catch {
        // Ignore
      }
    }
  }, [volume, currentTrack?.youtubeId]);

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
    (event: { target: YT.Player }) => {
      const player = event.target;
      playerRef.current = player;
      console.log("YouTube Player Ready for:", currentTrack?.title);
      try {
        player.setVolume(volume);
        player.playVideo();
      } catch (e) {
        console.error("onReady error:", e);
      }
    },
    [volume, currentTrack?.title]
  );

  const onStateChange = useCallback(
    (event: { data: number; target: YT.Player }) => {
      const state = event.data;
      const player = event.target;

      if (state === 1) {
        // PLAYING
        setIsPlaying(true);
        try {
          const dur = player.getDuration();
          if (dur > 0) setDuration(dur);
        } catch {
          // Ignore
        }
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
          try {
            player.seekTo(0, true);
            player.playVideo();
          } catch {
            // Ignore
          }
        } else {
          next();
        }
      }
    },
    [setIsPlaying, setDuration, startProgressTracking, stopProgressTracking, next]
  );

  const onError = useCallback(
    (event: { data: number }) => {
      console.error("YouTube Error:", event.data);
      stopProgressTracking();
      // Skip to next on error
      setTimeout(() => next(), 1000);
    },
    [next, stopProgressTracking]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      playerRef.current = null;
    };
  }, [stopProgressTracking]);

  // Clear player ref when track changes to non-YouTube
  useEffect(() => {
    if (!currentTrack?.youtubeId) {
      playerRef.current = null;
      stopProgressTracking();
    }
  }, [currentTrack?.youtubeId, stopProgressTracking]);

  // Don't render if no YouTube track or YouTube component not loaded
  if (!currentTrack?.youtubeId || !YouTube) {
    return null;
  }

  const opts = {
    height: "60",
    width: "80",
    playerVars: {
      autoplay: 1 as const,
      controls: 0 as const,
      disablekb: 1 as const,
      fs: 0 as const,
      modestbranding: 1 as const,
      rel: 0 as const,
      playsinline: 1 as const,
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

export default function YouTubePlayerComponent() {
  return (
    <YouTubeErrorBoundary>
      <YouTubePlayerInner />
    </YouTubeErrorBoundary>
  );
}
