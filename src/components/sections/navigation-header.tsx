"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Home, 
  ArrowDownToLine, 
  FileStack,
  User,
  LogOut,
  Music,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useSongs } from "@/context/songs-context";
import ALMusikLogo from "@/components/almusik-logo";

export default function NavigationHeader() {
  const { user, logout } = useAuth();
  const { songs } = useSongs();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter songs based on search query
  const searchResults = searchQuery.trim()
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSongClick = (songId: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(`/song/${songId}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 z-[200] flex h-[56px] md:h-[64px] w-full items-center justify-between bg-black px-3 md:px-8 text-white">
        {/* Left: Logo */}
        <div className="flex flex-shrink-0 items-center md:w-[300px]">
          <Link href="/" className="pr-2 md:pr-4 hover:opacity-90 transition-opacity">
            <ALMusikLogo size={28} className="md:w-9 md:h-9" />
          </Link>
        </div>

        {/* Center: Home and Search - Hidden on mobile/tablet */}
        <div className="hidden md:flex flex-1 max-w-[550px] items-center gap-2">
          {/* Home Button */}
          <Link
            href="/"
            aria-label="Home"
            className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F1F] text-[#B3B3B3] transition-colors hover:bg-[#2A2A2A] hover:text-white"
          >
            <Home className="h-6 w-6" strokeWidth={2.5} />
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1">
            <div className="group relative flex h-12 flex-1 items-center overflow-hidden rounded-[500px] bg-[#1F1F1F] transition-colors hover:bg-[#2A2A2A] hover:ring-1 hover:ring-[#3E3E3E] focus-within:bg-[#2A2A2A] focus-within:ring-2 focus-within:ring-white">
              <div className="flex pl-3 pr-2 text-[#B3B3B3] group-hover:text-white group-focus-within:text-white">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="search"
                aria-label="Cari lagu atau artis"
                placeholder="Cari lagu atau artis..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="flex-1 bg-transparent py-2 px-1 text-sm font-normal text-white placeholder-[#757575] outline-none placeholder:text-sm placeholder:font-normal"
              />
              <div className="flex border-l border-[#7C7C7C] border-opacity-30 pl-3 pr-3 text-[#B3B3B3] hover:text-white cursor-pointer transition-colors">
                <FileStack className="h-5 w-5" />
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] rounded-lg shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    <p className="px-4 py-2 text-xs text-[#b3b3b3] uppercase font-bold">Lagu</p>
                    {searchResults.map((song) => (
                      <div
                        key={song.id}
                        onClick={() => handleSongClick(song.id)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-[#3e3e3e] cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 bg-[#181818] rounded overflow-hidden flex-shrink-0 relative">
                          {song.cover ? (
                            <Image src={song.cover} alt={song.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-4 h-4 text-[#b3b3b3]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{song.title}</p>
                          <p className="text-[#b3b3b3] text-xs truncate">{song.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[#b3b3b3] text-sm">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet: Search & Home buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1F] text-[#B3B3B3] hover:text-white transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1F] text-[#B3B3B3] hover:text-white transition-colors"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>

        {/* Right: Navigation Links & Auth - Hidden on mobile/tablet */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-8 pl-4">
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

        {/* Mobile/Tablet: Menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1F] text-[#B3B3B3] hover:text-white transition-colors"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile/Tablet Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col md:hidden">
          <div className="flex items-center gap-2 p-3 border-b border-[#282828]">
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery("");
                setShowResults(false);
              }}
              className="flex h-9 w-9 items-center justify-center text-[#B3B3B3] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <div className="flex h-10 items-center rounded-full bg-[#1F1F1F] px-3">
                <Search className="h-4 w-4 text-[#B3B3B3] mr-2" />
                <input
                  type="search"
                  autoFocus
                  placeholder="Cari lagu atau artis..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#757575] outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery.trim() && searchResults.length > 0 ? (
              <div className="py-2">
                <p className="px-4 py-2 text-xs text-[#b3b3b3] uppercase font-bold">Lagu</p>
                {searchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      handleSongClick(song.id);
                      setMobileSearchOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#282828] active:bg-[#3e3e3e] cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#181818] rounded overflow-hidden flex-shrink-0 relative">
                      {song.cover ? (
                        <Image src={song.cover} alt={song.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-[#b3b3b3]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{song.title}</p>
                      <p className="text-[#b3b3b3] text-xs truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="px-4 py-12 text-center">
                <p className="text-[#b3b3b3] text-sm">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <Search className="w-12 h-12 text-[#535353] mx-auto mb-4" />
                <p className="text-[#b3b3b3] text-sm">Cari lagu atau artis favoritmu</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile/Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col md:hidden">
          <div className="flex items-center justify-between p-3 border-b border-[#282828]">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <ALMusikLogo size={28} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center text-[#B3B3B3] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#1F1F1F] rounded-lg">
                  <div className="w-10 h-10 bg-[#535353] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{user.name}</p>
                    <p className="text-[#b3b3b3] text-xs">{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-[#B3B3B3] hover:text-white hover:bg-[#1F1F1F] rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Home</span>
                  </Link>
                  <Link
                    href="/download"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-[#B3B3B3] hover:text-white hover:bg-[#1F1F1F] rounded-lg transition-colors"
                  >
                    <ArrowDownToLine className="w-5 h-5" />
                    <span className="font-medium">Install App</span>
                  </Link>
                </div>
                
                <div className="pt-4 border-t border-[#282828]">
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 w-full text-[#B3B3B3] hover:text-white hover:bg-[#1F1F1F] rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-[#B3B3B3] hover:text-white hover:bg-[#1F1F1F] rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Home</span>
                  </Link>
                  <Link
                    href="/download"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 text-[#B3B3B3] hover:text-white hover:bg-[#1F1F1F] rounded-lg transition-colors"
                  >
                    <ArrowDownToLine className="w-5 h-5" />
                    <span className="font-medium">Install App</span>
                  </Link>
                </div>
                
                <div className="pt-4 border-t border-[#282828] space-y-3">
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 text-white font-bold border border-[#535353] rounded-full hover:border-white transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 bg-white text-black font-bold rounded-full hover:bg-[#F2F2F2] transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
