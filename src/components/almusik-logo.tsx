"use client";

import React from "react";

interface ALMusikLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function ALMusikLogo({ size = 32, className = "", showText = true }: ALMusikLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1DB954" />
            <stop offset="50%" stopColor="#1ed760" />
            <stop offset="100%" stopColor="#15a847" />
          </linearGradient>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
        
        {/* Inner Shadow */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        
        {/* Sound Waves / Equalizer Bars */}
        <g filter="url(#glow)">
          {/* Left Bar */}
          <rect x="22" y="38" width="8" height="24" rx="4" fill="white" opacity="0.95">
            <animate attributeName="height" values="24;32;20;28;24" dur="1s" repeatCount="indefinite" />
            <animate attributeName="y" values="38;34;40;36;38" dur="1s" repeatCount="indefinite" />
          </rect>
          
          {/* Center-Left Bar */}
          <rect x="34" y="30" width="8" height="40" rx="4" fill="white" opacity="0.95">
            <animate attributeName="height" values="40;28;44;32;40" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="30;36;28;34;30" dur="1.2s" repeatCount="indefinite" />
          </rect>
          
          {/* Center Bar (Tallest) */}
          <rect x="46" y="24" width="8" height="52" rx="4" fill="white" opacity="0.95">
            <animate attributeName="height" values="52;36;48;40;52" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" values="24;32;26;30;24" dur="0.8s" repeatCount="indefinite" />
          </rect>
          
          {/* Center-Right Bar */}
          <rect x="58" y="32" width="8" height="36" rx="4" fill="white" opacity="0.95">
            <animate attributeName="height" values="36;44;30;38;36" dur="1.1s" repeatCount="indefinite" />
            <animate attributeName="y" values="32;28;35;31;32" dur="1.1s" repeatCount="indefinite" />
          </rect>
          
          {/* Right Bar */}
          <rect x="70" y="36" width="8" height="28" rx="4" fill="white" opacity="0.95">
            <animate attributeName="height" values="28;20;32;24;28" dur="0.9s" repeatCount="indefinite" />
            <animate attributeName="y" values="36;40;34;38;36" dur="0.9s" repeatCount="indefinite" />
          </rect>
        </g>
        
        {/* Subtle Shine Effect */}
        <ellipse cx="35" cy="30" rx="20" ry="15" fill="white" opacity="0.1" />
      </svg>
      
      {/* Text */}
      {showText && (
        <span className="text-xl font-bold tracking-tight text-white">
          AL<span className="text-[#1DB954]">Musik</span>
        </span>
      )}
    </div>
  );
}

// Static version without animation (for favicon/static use)
export function ALMusikLogoStatic({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradientStatic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1DB954" />
          <stop offset="50%" stopColor="#1ed760" />
          <stop offset="100%" stopColor="#15a847" />
        </linearGradient>
      </defs>
      
      <circle cx="50" cy="50" r="48" fill="url(#logoGradientStatic)" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
      
      <rect x="22" y="38" width="8" height="24" rx="4" fill="white" opacity="0.95" />
      <rect x="34" y="30" width="8" height="40" rx="4" fill="white" opacity="0.95" />
      <rect x="46" y="24" width="8" height="52" rx="4" fill="white" opacity="0.95" />
      <rect x="58" y="32" width="8" height="36" rx="4" fill="white" opacity="0.95" />
      <rect x="70" y="36" width="8" height="28" rx="4" fill="white" opacity="0.95" />
      
      <ellipse cx="35" cy="30" rx="20" ry="15" fill="white" opacity="0.1" />
    </svg>
  );
}
