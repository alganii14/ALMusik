"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Clock, Settings, User, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import ALMusikLogo from "@/components/almusik-logo";

export default function MobileHeader() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#5c3d6e] via-[#3d2a4a] to-transparent px-4 pt-3 pb-6">
        <div className="flex items-center justify-between">
          {/* Left: User Avatar & Greeting */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/mobile/settings" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1DB954] to-[#169c46] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-semibold text-base">
                  Halo, {user.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link href="/mobile" className="flex items-center gap-2">
                <ALMusikLogo size={28} />
                <span className="text-white font-bold text-lg">ALMusik</span>
              </Link>
            )}
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowNotifications(true)}
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors relative"
            >
              <Bell size={20} />
              {/* Notification dot */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#1DB954] rounded-full" />
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <Clock size={20} />
            </button>
            <Link 
              href="/mobile/settings"
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none -mx-4 px-4">
          <button className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full whitespace-nowrap">
            Semua
          </button>
          <button className="px-4 py-1.5 bg-[#232323] text-white text-sm font-medium rounded-full whitespace-nowrap hover:bg-[#2a2a2a] transition-colors">
            Musik
          </button>
          <button className="px-4 py-1.5 bg-[#232323] text-white text-sm font-medium rounded-full whitespace-nowrap hover:bg-[#2a2a2a] transition-colors">
            Podcast
          </button>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828]">
            <h2 className="text-white text-lg font-bold">Notifikasi</h2>
            <button onClick={() => setShowNotifications(false)} className="text-white p-2">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <Bell size={48} className="text-[#535353] mx-auto mb-4" />
              <p className="text-[#b3b3b3]">Belum ada notifikasi</p>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#282828]">
            <h2 className="text-white text-lg font-bold">Baru Diputar</h2>
            <button onClick={() => setShowHistory(false)} className="text-white p-2">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-center py-12">
              <Clock size={48} className="text-[#535353] mx-auto mb-4" />
              <p className="text-[#b3b3b3]">Belum ada riwayat pemutaran</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
