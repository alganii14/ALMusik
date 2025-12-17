"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  SquarePlay,
  Mic2,
  ListMusic,
  MonitorSpeaker,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  X,
} from "lucide-react";
import { usePlayer } from "@/context/player-context";
import { useFavorites } from "@/context/favorites-context";

// Random gradient backgrounds for lyrics
const LYRICS_GRADIENTS = [
  "linear-gradient(180deg, #1a3a3a 0%, #0d1f1f 50%, #0a1a1a 100%)", // teal
  "linear-gradient(180deg, #3a1a3a 0%, #1f0d1f 50%, #1a0a1a 100%)", // purple
  "linear-gradient(180deg, #1a1a3a 0%, #0d0d1f 50%, #0a0a1a 100%)", // blue
  "linear-gradient(180deg, #3a2a1a 0%, #1f150d 50%, #1a100a 100%)", // brown/orange
  "linear-gradient(180deg, #2a3a1a 0%, #151f0d 50%, #101a0a 100%)", // green
  "linear-gradient(180deg, #3a1a2a 0%, #1f0d15 50%, #1a0a10 100%)", // pink/magenta
  "linear-gradient(180deg, #1a2a3a 0%, #0d151f 50%, #0a101a 100%)", // ocean blue
  "linear-gradient(180deg, #3a3a1a 0%, #1f1f0d 50%, #1a1a0a 100%)", // yellow/gold
  "linear-gradient(180deg, #2a1a3a 0%, #150d1f 50%, #100a1a 100%)", // violet
  "linear-gradient(180deg, #1a3a2a 0%, #0d1f15 50%, #0a1a10 100%)", // emerald
];

interface LyricLine {
  time: number;
  text: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Parse LRC format lyrics: [mm:ss.xx]text
function parseLyrics(lyrics: string): LyricLine[] {
  const lines = lyrics.split("\n");
  const parsed: LyricLine[] = [];

  for (const line of lines) {
    // Match [mm:ss.xx] or [mm:ss] format
    const match = line.match(/^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)$/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const ms = match[3] ? parseInt(match[3].padEnd(3, "0")) : 0;
      const time = minutes * 60 + seconds + ms / 1000;
      const text = match[4].trim();
      if (text) {
        parsed.push({ time, text });
      }
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

export default function PlayerControls() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffle,
    isRepeat,
    isPreviewMode,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [lastVolume, setLastVolume] = useState(80);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);
  const [lyricsGradient, setLyricsGradient] = useState(LYRICS_GRADIENTS[0]);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLDivElement>(null);

  // Change gradient when song changes
  useEffect(() => {
    if (currentTrack?.id) {
      const randomIndex = Math.floor(Math.random() * LYRICS_GRADIENTS.length);
      setLyricsGradient(LYRICS_GRADIENTS[randomIndex]);
    }
  }, [currentTrack?.id]);

  // Toggle browser fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Parse lyrics
  const parsedLyrics = useMemo(() => {
    if (!currentTrack?.lyrics) return [];
    return parseLyrics(currentTrack.lyrics);
  }, [currentTrack?.lyrics]);

  // Check if lyrics are timed (LRC format)
  const isTimedLyrics = parsedLyrics.length > 0;

  // Update current line based on progress
  useEffect(() => {
    if (!isTimedLyrics || !showLyrics) return;

    let newIndex = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (progress >= parsedLyrics[i].time) {
        newIndex = i;
        break;
      }
    }
    setCurrentLineIndex(newIndex);
  }, [progress, parsedLyrics, isTimedLyrics, showLyrics]);

  // Auto-scroll to current line
  useEffect(() => {
    if (!showLyrics || currentLineIndex < 0 || !lyricsContainerRef.current) return;

    const container = lyricsContainerRef.current;
    const activeLine = container.querySelector(`[data-line="${currentLineIndex}"]`);
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLineIndex, showLyrics]);

  const toggleLike = () => {
    if (currentTrack) {
      toggleFavorite(currentTrack.id);
    }
  };

  const handleVolumeClick = () => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
    } else {
      setVolume(lastVolume || 50);
    }
  };

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const rect = volumeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(100, percent * 100)));
  };

  const handleSeekDrag = (e: MouseEvent) => {
    const rect = seekRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(percent * duration);
  };

  // Volume drag handlers
  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true);
    handleVolumeChange(e);
  };

  // Seek drag handlers
  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingSeek(true);
    handleSeekClick(e);
  };

  // Global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingVolume) {
        handleVolumeChange(e);
      }
      if (isDraggingSeek) {
        handleSeekDrag(e);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingVolume(false);
      setIsDraggingSeek(false);
    };

    if (isDraggingVolume || isDraggingSeek) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingVolume, isDraggingSeek, duration]);

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* Lyrics Full Screen - Spotify Style */}
      {showLyrics && (
        <div className="fixed inset-0 z-[100] flex flex-col transition-all duration-700" style={{ background: lyricsGradient }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-20 pb-2 sm:pb-4 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              {currentTrack?.imageUrl ? (
                <Image 
                  src={currentTrack.imageUrl} 
                  alt={currentTrack.title} 
                  width={56} 
                  height={56} 
                  className="rounded shadow-lg w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0" 
                  unoptimized 
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#282828] rounded shadow-lg flex items-center justify-center flex-shrink-0">
                  <Mic2 size={20} className="text-[#5a9a9a] sm:w-6 sm:h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-sm sm:text-base md:text-lg truncate">{currentTrack?.title || "Tidak ada lagu"}</h3>
                <p className="text-[#b3b3b3] text-xs sm:text-sm truncate">{currentTrack?.artist}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowLyrics(false)}
              className="p-2 sm:p-3 text-[#b3b3b3] hover:text-white transition-colors rounded-full hover:bg-white/10 flex-shrink-0"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Lyrics Content */}
          <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 scroll-smooth">
            {currentTrack?.lyrics ? (
              isTimedLyrics ? (
                // Timed lyrics (LRC format) - Spotify style
                <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-4 py-4 sm:py-6 md:py-8 max-w-3xl mx-auto">
                  {parsedLyrics.map((line, index) => (
                    <div
                      key={index}
                      data-line={index}
                      onClick={() => seek(line.time)}
                      className={`text-left text-lg sm:text-xl md:text-[28px] leading-tight font-bold cursor-pointer transition-all duration-500 py-1 sm:py-2 ${
                        index === currentLineIndex
                          ? "text-white"
                          : index < currentLineIndex
                          ? "text-[#4a7c7c]"
                          : "text-[#5a9a9a] hover:text-[#7abfbf]"
                      }`}
                    >
                      {line.text}
                    </div>
                  ))}
                  <div className="h-[30vh] sm:h-[40vh]"></div>
                </div>
              ) : (
                // Plain lyrics (no timestamps)
                <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-4 py-4 sm:py-6 md:py-8 max-w-3xl mx-auto">
                  {currentTrack.lyrics.split("\n").map((line, index) => (
                    <div
                      key={index}
                      className="text-left text-lg sm:text-xl md:text-[28px] leading-tight font-bold text-[#5a9a9a] py-1 sm:py-2"
                    >
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#5a9a9a]">
                <Mic2 size={48} className="mb-4 sm:mb-6 opacity-50 sm:w-16 sm:h-16" />
                <p className="text-base sm:text-lg md:text-xl text-center px-4">Lirik tidak tersedia untuk lagu ini</p>
              </div>
            )}
          </div>

          {/* Mini Player at Bottom */}
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-black/30">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs text-[#b3b3b3] min-w-[32px] sm:min-w-[40px]">{formatTime(progress)}</span>
                <div 
                  className="flex-1 h-1 bg-[#4d4d4d] rounded-full cursor-pointer group"
                  onClick={handleSeekClick}
                >
                  <div 
                    className="h-full bg-white rounded-full group-hover:bg-[#1db954] transition-colors" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-[#b3b3b3] min-w-[32px] sm:min-w-[40px]">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <button onClick={previous} className="text-white hover:scale-110 transition-transform">
                  <SkipBack size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> : <Play size={20} className="sm:w-6 sm:h-6 ml-0.5" fill="currentColor" />}
                </button>
                <button onClick={next} className="text-white hover:scale-110 transition-transform">
                  <SkipForward size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Now Playing View - Spotify Style */}
      {showNowPlaying && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6 md:pb-8"
          style={{ background: "linear-gradient(180deg, #404040 0%, #181818 100%)" }}
        >
          {/* Close Button */}
          <button 
            onClick={() => setShowNowPlaying(false)}
            className="absolute top-4 sm:top-6 md:top-20 right-4 sm:right-6 p-2 text-[#b3b3b3] hover:text-white transition-colors z-10"
          >
            <X size={24} className="sm:w-7 sm:h-7" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center max-w-lg w-full px-4 sm:px-6 md:px-8 overflow-y-auto">
            {/* Album Cover */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-lg shadow-2xl overflow-hidden mb-4 sm:mb-6 flex-shrink-0">
              {currentTrack?.imageUrl ? (
                <Image 
                  src={currentTrack.imageUrl} 
                  alt={currentTrack.title} 
                  width={320} 
                  height={320} 
                  className="w-full h-full object-cover" 
                  unoptimized 
                />
              ) : (
                <div className="w-full h-full bg-[#282828] flex items-center justify-center">
                  <Mic2 size={60} className="text-[#7f7f7f] sm:w-20 sm:h-20" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 w-full px-2">
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold truncate">{currentTrack?.title || "Tidak ada lagu"}</h2>
              <p className="text-[#b3b3b3] text-sm sm:text-base md:text-lg mt-1">{currentTrack?.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full mb-3 sm:mb-4">
              <div 
                className="h-1 bg-[#4d4d4d] rounded-full cursor-pointer group"
                onClick={handleSeekClick}
              >
                <div 
                  className="h-full bg-white rounded-full group-hover:bg-[#1db954]" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-[#b3b3b3]">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
              <button
                onClick={toggleShuffle}
                className={`${isShuffle ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"} transition-colors`}
              >
                <Shuffle size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button onClick={previous} className="text-white hover:scale-110 transition-transform">
                <SkipBack size={24} className="sm:w-7 sm:h-7" fill="currentColor" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8" fill="currentColor" /> : <Play size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 ml-0.5 sm:ml-1" fill="currentColor" />}
              </button>
              <button onClick={next} className="text-white hover:scale-110 transition-transform">
                <SkipForward size={24} className="sm:w-7 sm:h-7" fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`${isRepeat ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"} transition-colors`}
              >
                <Repeat size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Extra buttons */}
            <div className="flex items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <button 
                onClick={() => { setShowNowPlaying(false); setShowLyrics(true); }}
                className="text-[#b3b3b3] hover:text-white transition-colors flex items-center gap-2"
              >
                <Mic2 size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Lirik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Footer Player */}
      <footer className="h-[64px] sm:h-[72px] md:h-[90px] bg-[#181818] border-t border-[#282828] px-2 sm:px-3 md:px-4 flex items-center justify-between select-none fixed bottom-0 left-0 right-0 z-50 font-sans text-[#b3b3b3]">
      {/* LEFT SECTION: Track Info */}
      <div className="flex items-center flex-1 min-w-0 gap-2 sm:gap-3 md:gap-3.5 md:w-[30%] md:min-w-[180px] md:flex-none">
        <div className="relative group flex-shrink-0">
          {currentTrack?.imageUrl ? (
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden transition-[bottom] group-hover:-translate-y-1">
              <Image src={currentTrack.imageUrl} alt={currentTrack.title} width={56} height={56} className="object-cover w-full h-full" unoptimized />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#282828] rounded shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-[bottom] group-hover:-translate-y-1">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#7f7f7f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center overflow-hidden gap-0.5 min-w-0 flex-1 md:flex-none">
          <a href="#" className="text-white text-xs sm:text-[13px] md:text-[14px] font-normal hover:underline truncate leading-tight">
            {currentTrack?.title || "No track selected"}
          </a>
          <a href="#" className="text-[10px] sm:text-[11px] text-[#b3b3b3] hover:text-white hover:underline truncate leading-tight">
            {currentTrack?.artist || "Select a song to play"}
          </a>
        </div>
        <button
          onClick={toggleLike}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 ${isLiked ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"}`}
          aria-label={isLiked ? "Remove from Library" : "Save to Your Library"}
        >
          <svg
            role="img"
            height="14"
            width="14"
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isLiked ? 0 : 1.5}
            className="transition-colors sm:w-4 sm:h-4"
          >
            <path d="M1.69 2.5a4.37 4.37 0 0 1 5.61 0 4.37 4.37 0 0 1 5.61 0 4.37 4.37 0 0 1 0 5.61L8.5 13.5 4.11 8.11a4.37 4.37 0 0 1-2.42-5.61z" />
          </svg>
        </button>
      </div>

      {/* CENTER SECTION: Player Controls - Hidden on mobile, show minimal on tablet */}
      <div className="hidden sm:flex flex-col items-center max-w-[722px] w-[40%] gap-1 md:gap-1.5">
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-0.5">
          <button
            onClick={toggleShuffle}
            className={`w-7 h-7 sm:w-8 sm:h-8 hidden md:flex items-center justify-center relative ${isShuffle ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"} transition-colors`}
            aria-label="Enable shuffle"
          >
            <Shuffle size={14} className="md:w-4 md:h-4" />
            {isShuffle && <div className="absolute bottom-0 w-1 h-1 bg-[#1db954] rounded-full translate-y-1"></div>}
          </button>

          <button onClick={previous} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" aria-label="Previous">
            <SkipBack size={14} className="sm:w-4 sm:h-4" fill="currentColor" />
          </button>

          <button
            onClick={togglePlay}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 active:bg-[#f0f0f0]"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={14} className="sm:w-4 sm:h-4 text-black" fill="currentColor" /> : <Play size={14} className="sm:w-4 sm:h-4 text-black ml-0.5" fill="currentColor" />}
          </button>

          <button onClick={next} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" aria-label="Next">
            <SkipForward size={14} className="sm:w-4 sm:h-4" fill="currentColor" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`w-7 h-7 sm:w-8 sm:h-8 hidden md:flex items-center justify-center relative ${isRepeat ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"} transition-colors`}
            aria-label="Enable repeat"
          >
            <Repeat size={14} className="md:w-4 md:h-4" />
            {isRepeat && <div className="absolute bottom-0 w-1 h-1 bg-[#1db954] rounded-full translate-y-1"></div>}
          </button>
        </div>

        <div className="w-full hidden md:flex items-center gap-2 text-[11px] font-normal text-[#a7a7a7]">
          <span className="min-w-[40px] text-right font-variant-numeric tabular-nums">{formatTime(progress)}</span>

          {/* Progress Bar */}
          <div
            ref={seekRef}
            className="group relative h-1 w-full bg-[#4d4d4d] rounded-full cursor-pointer"
            onMouseEnter={() => setIsHoveringSeek(true)}
            onMouseLeave={() => !isDraggingSeek && setIsHoveringSeek(false)}
            onMouseDown={handleSeekMouseDown}
          >
            <div className={`h-full rounded-full ${isHoveringSeek || isDraggingSeek ? "bg-[#1db954]" : "bg-white"}`} style={{ width: `${progressPercent}%` }}></div>
            <div
              className={`absolute w-3 h-3 bg-white rounded-full shadow-md ${isHoveringSeek || isDraggingSeek ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
              style={{ left: `calc(${progressPercent}% - 6px)`, top: "50%", transform: "translateY(-50%)" }}
            ></div>
          </div>

          <span className="min-w-[40px] text-left font-variant-numeric tabular-nums">
            {isPreviewMode ? formatTime(Math.min(duration, 30)) : formatTime(duration)}
          </span>
          {isPreviewMode && (
            <span className="ml-2 text-[10px] bg-[#1DB954] text-black px-2 py-0.5 rounded-full font-bold">
              PREVIEW
            </span>
          )}
        </div>
      </div>

      {/* MOBILE CENTER: Play controls only */}
      <div className="flex sm:hidden items-center gap-2">
        <button onClick={previous} className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" aria-label="Previous">
          <SkipBack size={16} fill="currentColor" />
        </button>
        <button
          onClick={togglePlay}
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={next} className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" aria-label="Next">
          <SkipForward size={16} fill="currentColor" />
        </button>
      </div>

      {/* RIGHT SECTION: Volume & Extra Controls */}
      <div className="flex items-center justify-end gap-1 sm:gap-2 md:w-[30%] md:min-w-[180px]">
        <button 
          onClick={() => setShowNowPlaying(!showNowPlaying)}
          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors ${showNowPlaying ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"}`} 
          aria-label="Now playing view" 
          title="Now playing view"
        >
          <SquarePlay size={14} className="sm:w-4 sm:h-4" strokeWidth={2} />
        </button>

        <button 
          onClick={() => setShowLyrics(!showLyrics)}
          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors ${showLyrics ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"}`} 
          aria-label="Lyrics" 
          title="Lyrics"
        >
          <Mic2 size={14} className="sm:w-4 sm:h-4" strokeWidth={2} />
        </button>

        <button className="w-7 h-7 sm:w-8 sm:h-8 hidden md:flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" aria-label="Queue" title="Queue">
          <ListMusic size={16} strokeWidth={2} />
        </button>

        <button className="w-7 h-7 sm:w-8 sm:h-8 hidden lg:flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" aria-label="Connect to a device" title="Connect to a device">
          <MonitorSpeaker size={16} strokeWidth={2} />
        </button>

        <div className="hidden md:flex items-center gap-2 w-[100px] lg:w-[120px]">
          <button
            onClick={handleVolumeClick}
            className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors flex-shrink-0"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
            title={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? <VolumeX size={16} /> : volume < 50 ? <Volume1 size={16} /> : <Volume2 size={16} />}
          </button>

          <div
            ref={volumeRef}
            className="group/volume relative h-1 flex-1 bg-[#4d4d4d] rounded-full cursor-pointer"
            onMouseEnter={() => setIsHoveringVolume(true)}
            onMouseLeave={() => !isDraggingVolume && setIsHoveringVolume(false)}
            onMouseDown={handleVolumeMouseDown}
          >
            <div className={`h-full rounded-full ${isHoveringVolume || isDraggingVolume ? "bg-[#1db954]" : "bg-white"}`} style={{ width: `${volume}%` }}></div>
            <div
              className={`absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-md ${isHoveringVolume || isDraggingVolume ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
              style={{ left: `calc(${volume}% - 6px)`, top: "50%", transform: "translateY(-50%)" }}
            ></div>
          </div>
        </div>

        <button 
          onClick={toggleFullscreen}
          className={`w-7 h-7 sm:w-8 sm:h-8 hidden sm:flex items-center justify-center transition-colors ${isFullscreen ? "text-[#1db954]" : "text-[#b3b3b3] hover:text-white"}`}
          aria-label={isFullscreen ? "Exit full screen" : "Full screen"} 
          title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
        >
          <Maximize2 size={14} className="sm:w-4 sm:h-4" strokeWidth={2} />
        </button>
      </div>
    </footer>
    </>
  );
}
