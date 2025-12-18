"use client";

import Link from "next/link";
import { Bell, Clock, Settings } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import ALMusikLogo from "@/components/almusik-logo";

export default function MobileHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-[#5c3d6e] to-transparent px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ALMusikLogo size={28} />
          {user && (
            <span className="text-white font-bold text-lg">
              Halo, {user.name.split(" ")[0]}!
            </span>
          )}
          {!user && (
            <span className="text-white font-bold text-lg">ALMusik</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white">
            <Bell size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white">
            <Clock size={18} />
          </button>
          <Link 
            href="/mobile/settings"
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center text-white"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
