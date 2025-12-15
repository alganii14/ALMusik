"use client";

import React from "react";
import Link from "next/link";
import { 
  Search, 
  Home, 
  ArrowDownToLine, 
  Disc, 
  FileStack,
  User,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function NavigationHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 z-[200] flex h-[64px] w-full items-center justify-between bg-black px-8 text-white">
      {/* Left: Logo */}
      <div className="flex w-[300px] flex-shrink-0 items-center">
        <Link href="/" className="flex items-center gap-2 pr-4 hover:opacity-90 transition-opacity">
          <Disc className="h-8 w-8 text-white" fill="currentColor" />
          <span className="text-xl font-bold tracking-tighter text-white">ALMusik</span>
        </Link>
      </div>

      {/* Center: Home and Search */}
      <div className="flex flex-1 max-w-[550px] items-center gap-2">
        {/* Home Button */}
        <button
          aria-label="Home"
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F1F] text-[#B3B3B3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
        >
          <Home className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {/* Search Bar */}
        <div className="group relative flex h-12 flex-1 items-center overflow-hidden rounded-[500px] bg-[#1F1F1F] transition-colors hover:bg-[#2A2A2A] hover:ring-1 hover:ring-[#3E3E3E] focus-within:bg-[#2A2A2A] focus-within:ring-2 focus-within:ring-white">
          <div className="flex pl-3 pr-2 text-[#B3B3B3] group-hover:text-white group-focus-within:text-white">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="search"
            aria-label="What do you want to play?"
            placeholder="What do you want to play?"
            className="flex-1 bg-transparent py-2 px-1 text-sm font-normal text-white placeholder-[#757575] outline-none placeholder:text-sm placeholder:font-normal"
          />
          <div className="flex border-l border-[#7C7C7C] border-opacity-30 pl-3 pr-3 text-[#B3B3B3] hover:text-white cursor-pointer transition-colors">
            <FileStack className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Right: Navigation Links & Auth */}
      <div className="flex flex-shrink-0 items-center justify-end gap-8 pl-4">
        {/* Links */}
        <nav className="hidden items-center gap-8 lg:flex">
          <button className="text-sm font-bold text-[#B3B3B3] transition-colors hover:text-white hover:scale-105">
            Premium
          </button>
          <button className="text-sm font-bold text-[#B3B3B3] transition-colors hover:text-white hover:scale-105">
            Support
          </button>
          <button className="text-sm font-bold text-[#B3B3B3] transition-colors hover:text-white hover:scale-105">
            Download
          </button>
        </nav>

        {/* Divider */}
        <div className="hidden h-6 w-[1px] bg-white lg:block" />

        {/* Utilities */}
        <div className="flex items-center gap-6">
          <Link
            href="/download"
            className="hidden items-center gap-1 text-sm font-bold text-[#B3B3B3] transition-colors hover:text-white hover:scale-105 lg:flex"
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>Install App</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#282828] rounded-full px-2 py-1">
                <div className="w-7 h-7 bg-[#535353] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white pr-2">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm font-bold text-[#B3B3B3] transition-colors hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/signup"
                data-testid="signup-button"
                className="whitespace-nowrap text-base font-bold text-[#B3B3B3] transition-colors hover:text-white hover:scale-105"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                data-testid="login-button"
                className="flex items-center justify-center whitespace-nowrap rounded-full bg-white px-8 py-3 text-base font-bold text-black transition-transform hover:scale-105 hover:bg-[#F2F2F2] active:scale-100"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}