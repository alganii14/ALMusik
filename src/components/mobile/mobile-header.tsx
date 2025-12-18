"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Clock, Settings, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import ALMusikLogo from "@/components/almusik-logo";

export default function MobileHeader() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-gradient-to-b from-[#4a2d5c] to-[#121212] px-4 pt-2 pb-4">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: Logo & Greeting */}
          <div className="flex items-center gap-2">
            <ALMusikLogo size={24} />
            <span className="text-white font-bold text-base">
              {user ? `Halo, ${user.name.split(" ")[0]}!` : "ALMusik"}
            </span>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowNotifications(true)}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white"
            >
              <Bell size={18} />
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white"
            >
              <Clock size={18} />
            </button>
            <Link 
              href="/mobile/settings"
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-white text-black text-xs font-semibold rounded-full">
            Semua
          </button>
          <button className="px-3 py-1 bg-[#2a2a2a] text-white text-xs font-medium rounded-full">
            Musik
          </button>
          <button className="px-3 py-1 bg-[#2a2a2a] text-white text-xs font-medium rounded-full">
            Podcast
          </button>
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-[200] bg-[#121212] flex flex-col max-w-md mx-auto">
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
        <div className="fixed inset-0 z-[200] bg-[#121212] flex flex-col max-w-md mx-auto">
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
