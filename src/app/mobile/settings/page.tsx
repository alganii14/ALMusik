"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  Bell,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Moon,
  Volume2,
  Download,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import MobilePlayer from "@/components/mobile/mobile-player";
import MobileNavigation from "@/components/mobile/mobile-navigation";

export default function MobileSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentTrack } = usePlayer();
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";

  const handleLogout = () => {
    logout();
    router.push("/mobile/login");
  };

  const settingsGroups = [
    {
      title: "Akun",
      items: [
        { icon: User, label: "Profil", href: "/mobile/profile" },
        { icon: Bell, label: "Notifikasi", href: "/mobile/notifications" },
        { icon: Shield, label: "Privasi", href: "/mobile/privacy" },
      ],
    },
    {
      title: "Preferensi",
      items: [
        { icon: Volume2, label: "Kualitas Audio", href: "/mobile/audio-quality" },
        { icon: Download, label: "Download", href: "/mobile/downloads" },
        { icon: Moon, label: "Tampilan", href: "/mobile/appearance" },
      ],
    },
    {
      title: "Lainnya",
      items: [
        { icon: HelpCircle, label: "Bantuan", href: "/mobile/help" },
        { icon: Info, label: "Tentang", href: "/mobile/about" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Pengaturan</h1>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 pb-8 ${bottomPadding}`}>
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-4 py-4 mb-4 border-b border-[#282828]">
            <div className="w-14 h-14 bg-[#535353] rounded-full flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{user.name}</p>
              <p className="text-[#b3b3b3] text-sm">{user.email}</p>
            </div>
          </div>
        )}

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-2 px-2">
              {group.title}
            </h2>
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
              {group.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-[#282828] transition-colors ${
                      index !== group.items.length - 1 ? "border-b border-[#282828]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-[#b3b3b3]" />
                      <span className="text-white text-sm">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-[#b3b3b3]" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-[#b3b3b3] hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        )}

        {/* Login Button */}
        {!user && (
          <Link
            href="/mobile/login"
            className="block w-full text-center bg-white text-black font-bold py-3 rounded-full hover:scale-105 transition-transform"
          >
            Login
          </Link>
        )}

        {/* Version */}
        <p className="text-center text-[#535353] text-xs mt-8">
          ALMusik v1.0.0
        </p>
      </div>

      <MobilePlayer />
      <MobileNavigation activeTab="home" onTabChange={() => router.push("/mobile")} />
    </div>
  );
}
