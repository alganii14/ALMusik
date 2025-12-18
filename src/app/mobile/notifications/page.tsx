"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, Music, Users, Megaphone } from "lucide-react";

export default function MobileNotificationsPage() {
  const router = useRouter();
  const [newMusic, setNewMusic] = useState(true);
  const [playlistUpdates, setPlaylistUpdates] = useState(true);
  const [friendActivity, setFriendActivity] = useState(false);
  const [promotions, setPromotions] = useState(false);

  const notifications = [
    {
      id: "newMusic",
      icon: Music,
      label: "Musik Baru",
      desc: "Rilis baru dari artis yang kamu ikuti",
      value: newMusic,
      onChange: setNewMusic,
    },
    {
      id: "playlistUpdates",
      icon: Bell,
      label: "Update Playlist",
      desc: "Perubahan pada playlist kolaboratif",
      value: playlistUpdates,
      onChange: setPlaylistUpdates,
    },
    {
      id: "friendActivity",
      icon: Users,
      label: "Aktivitas Teman",
      desc: "Saat teman mendengarkan musik",
      value: friendActivity,
      onChange: setFriendActivity,
    },
    {
      id: "promotions",
      icon: Megaphone,
      label: "Promosi",
      desc: "Penawaran dan rekomendasi",
      value: promotions,
      onChange: setPromotions,
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Notifikasi</h1>
      </header>

      <div className="px-4 py-4">
        <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
          {notifications.map((notif, index) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-center justify-between px-4 py-4 ${
                  index !== notifications.length - 1 ? "border-b border-[#282828]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-[#b3b3b3]" />
                  <div>
                    <p className="text-white text-sm">{notif.label}</p>
                    <p className="text-[#b3b3b3] text-xs">{notif.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => notif.onChange(!notif.value)}
                  className={`w-12 h-7 rounded-full transition-colors ${
                    notif.value ? "bg-[#1DB954]" : "bg-[#535353]"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${
                    notif.value ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-[#535353] text-xs text-center mt-6 px-4">
          Kamu juga bisa mengatur notifikasi di pengaturan perangkat
        </p>
      </div>
    </div>
  );
}
