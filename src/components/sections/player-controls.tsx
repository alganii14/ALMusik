'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  Maximize2 
} from 'lucide-react';
import { usePlayer } from '@/context/player-context';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [lastVolume, setLastVolume] = useState(80);

  const toggleLike = () => setIsLiked(!isLiked);
  
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

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(100, percent * 100)));
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="h-[90px] bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between select-none fixed bottom-0 left-0 right-0 z-50 font-sans text-[#b3b3b3]">
      
      {/* LEFT SECTION: Track Info */}
      <div className="flex items-center w-[30%] min-w-[180px] gap-3.5">
        <div className="relative group flex-shrink-0">
            {currentTrack ? (
              <div className="w-14 h-14 rounded shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden transition-[bottom] group-hover:-translate-y-1">
                <Image
                  src={currentTrack.imageUrl}
                  alt={currentTrack.title}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 bg-[#282828] rounded shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-[bottom] group-hover:-translate-y-1">
                   <svg className="w-6 h-6 text-[#7f7f7f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
              </div>
            )}
        </div>
        <div className="flex flex-col justify-center overflow-hidden gap-0.5">
          <a href="#" className="text-white text-[14px] font-normal hover:underline truncate leading-tight">
            {currentTrack?.title || 'No track selected'}
          </a>
          <a href="#" className="text-[11px] text-[#b3b3b3] hover:text-white hover:underline truncate leading-tight">
            {currentTrack?.artist || 'Select a song to play'}
          </a>
        </div>
        <button 
          onClick={toggleLike}
          className={`flex items-center justify-center w-8 h-8 ml-1 ${isLiked ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'}`}
          aria-label={isLiked ? "Remove from Library" : "Save to Your Library"}
        >
           <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isLiked ? 0 : 1.5} className="transition-colors">
              <path d="M1.69 2.5a4.37 4.37 0 0 1 5.61 0 4.37 4.37 0 0 1 5.61 0 4.37 4.37 0 0 1 0 5.61L8.5 13.5 4.11 8.11a4.37 4.37 0 0 1-2.42-5.61z" />
           </svg>
        </button>
      </div>

      {/* CENTER SECTION: Player Controls */}
      <div className="flex flex-col items-center max-w-[722px] w-[40%] gap-1.5">
        <div className="flex items-center gap-5 mb-0.5">
            <button 
              onClick={toggleShuffle}
              className={`w-8 h-8 flex items-center justify-center relative ${isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'} transition-colors`}
              aria-label="Enable shuffle"
            >
              <Shuffle size={16} />
              {isShuffle && <div className="absolute bottom-0 w-1 h-1 bg-[#1db954] rounded-full translate-y-1"></div>}
            </button>

            <button 
              onClick={previous}
              className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" 
              aria-label="Previous"
            >
              <SkipBack size={16} fill="currentColor" />
            </button>

            <button 
              onClick={togglePlay}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95 active:bg-[#f0f0f0]" 
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={16} fill="currentColor" className="text-black" />
              ) : (
                <Play size={16} fill="currentColor" className="text-black ml-0.5" />
              )}
            </button>

            <button 
              onClick={next}
              className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" 
              aria-label="Next"
            >
              <SkipForward size={16} fill="currentColor" />
            </button>

            <button 
              onClick={toggleRepeat}
              className={`w-8 h-8 flex items-center justify-center relative ${isRepeat ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'} transition-colors`}
              aria-label="Enable repeat"
            >
              <Repeat size={16} />
              {isRepeat && <div className="absolute bottom-0 w-1 h-1 bg-[#1db954] rounded-full translate-y-1"></div>}
            </button>
        </div>

        <div className="w-full flex items-center gap-2 text-[11px] font-normal text-[#a7a7a7]">
          <span className="min-w-[40px] text-right font-variant-numeric tabular-nums">{formatTime(progress)}</span>
          
          {/* Progress Bar */}
          <div 
             className="group relative h-1 w-full bg-[#4d4d4d] rounded-full cursor-pointer hBox"
             onMouseEnter={() => setIsHoveringSeek(true)}
             onMouseLeave={() => setIsHoveringSeek(false)}
             onClick={handleSeekClick}
          >
             {/* Slider Track */}
             <div 
               className={`h-full rounded-full group-hover:bg-[#1db954] bg-white`}
               style={{ width: `${progressPercent}%` }}
             ></div>
             
             {/* Slider Thumb */}
             <div 
               className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md ${isHoveringSeek ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
               style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
             ></div>
          </div>

          <span className="min-w-[40px] text-left font-variant-numeric tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT SECTION: Volume & Extra Controls */}
      <div className="flex items-center justify-end w-[30%] min-w-[180px] gap-2">
        <button 
           className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" 
           aria-label="Now playing view"
           title="Now playing view"
        >
          <SquarePlay size={16} strokeWidth={2} />
        </button>

        <button 
           className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" 
           aria-label="Lyrics"
           title="Lyrics"
        >
          <Mic2 size={16} strokeWidth={2} />
        </button>

        <button 
           className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" 
           aria-label="Queue"
           title="Queue"
        >
          <ListMusic size={16} strokeWidth={2} />
        </button>

        <button 
           className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors" 
           aria-label="Connect to a device"
           title="Connect to a device"
        >
          <MonitorSpeaker size={16} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-2 w-[120px]">
           <button 
             onClick={handleVolumeClick}
             className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors flex-shrink-0"
             aria-label={volume === 0 ? "Unmute" : "Mute"}
             title={volume === 0 ? "Unmute" : "Mute"}
           >
             {volume === 0 ? (
               <VolumeX size={16} />
             ) : volume < 50 ? (
               <Volume1 size={16} />
             ) : (
               <Volume2 size={16} />
             )}
           </button>
           
           <div 
             className="group/volume relative h-1 flex-1 bg-[#4d4d4d] rounded-full cursor-pointer"
             onMouseEnter={() => setIsHoveringVolume(true)}
             onMouseLeave={() => setIsHoveringVolume(false)}
             onClick={handleVolumeChange}
           >
              <div 
                className={`h-full rounded-full group-hover/volume:bg-[#1db954] bg-white`}
                style={{ width: `${volume}%` }}
              ></div>
               <div 
               className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md ${isHoveringVolume ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
               style={{ left: `${volume}%`, transform: 'translate(-50%, -50%)' }}
             ></div>
           </div>
        </div>

        <button 
           className="w-8 h-8 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors ml-1" 
           aria-label="Full screen"
           title="Full screen"
        >
          <Maximize2 size={16} strokeWidth={2} />
        </button>
      </div>
    </footer>
  );
}