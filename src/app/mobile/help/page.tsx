"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronUp, Search, MessageCircle, Mail } from "lucide-react";
import { usePlayer } from "@/context/player-context";
import MobilePlayer from "@/components/mobile/mobile-player";
import MobileNavigation from "@/components/mobile/mobile-navigation";

const FAQ_DATA = [
  {
    question: "Bagaimana cara memutar lagu?",
    answer: "Cukup tap pada lagu yang ingin kamu dengarkan. Lagu akan langsung diputar dan muncul di mini player di bagian bawah layar."
  },
  {
    question: "Bagaimana cara membuat playlist?",
    answer: "Pergi ke tab Library, lalu tap tombol '+' di pojok kanan atas. Pilih 'Playlist Biasa' atau 'Playlist Kolaboratif', beri nama, dan playlist siap digunakan."
  },
  {
    question: "Bagaimana cara menyukai lagu?",
    answer: "Tap ikon hati di sebelah judul lagu saat sedang diputar. Lagu yang disukai akan tersimpan di 'Lagu yang Disukai' di Library."
  },
  {
    question: "Apakah bisa mendengarkan offline?",
    answer: "Saat ini fitur offline belum tersedia. Kamu memerlukan koneksi internet untuk streaming musik."
  },
  {
    question: "Bagaimana cara mengubah kualitas audio?",
    answer: "Pergi ke Pengaturan > Kualitas Audio. Kamu bisa memilih dari Rendah hingga Sangat Tinggi sesuai kebutuhan."
  },
  {
    question: "Bagaimana cara install aplikasi di HP?",
    answer: "Buka menu browser dan pilih 'Install app' atau 'Add to Home Screen'. Aplikasi akan terinstall seperti aplikasi native."
  },
];

export default function MobileHelpPage() {
  const router = useRouter();
  const { currentTrack } = usePlayer();
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredFAQ = FAQ_DATA.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Bantuan</h1>
      </header>

      <div className={`flex-1 overflow-y-auto px-4 py-4 ${bottomPadding}`}>
        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b3b3]" />
          <input
            type="text"
            placeholder="Cari bantuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#282828] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DB954] placeholder:text-[#727272]"
          />
        </div>

        {/* FAQ */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Pertanyaan Umum
          </h2>
          <div className="space-y-2">
            {filteredFAQ.map((faq, index) => (
              <div key={index} className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-white text-sm pr-4">{faq.question}</span>
                  {expandedIndex === index ? (
                    <ChevronUp size={18} className="text-[#b3b3b3] flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-[#b3b3b3] flex-shrink-0" />
                  )}
                </button>
                {expandedIndex === index && (
                  <div className="px-4 pb-4">
                    <p className="text-[#b3b3b3] text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h2 className="text-[#b3b3b3] text-xs uppercase font-bold mb-3 px-2">
            Hubungi Kami
          </h2>
          <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
            <button className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#282828] hover:bg-[#282828] transition-colors">
              <MessageCircle size={20} className="text-[#1DB954]" />
              <div className="text-left">
                <p className="text-white text-sm">Live Chat</p>
                <p className="text-[#b3b3b3] text-xs">Respon cepat 24/7</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#282828] transition-colors">
              <Mail size={20} className="text-[#1DB954]" />
              <div className="text-left">
                <p className="text-white text-sm">Email</p>
                <p className="text-[#b3b3b3] text-xs">support@almusik.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <MobilePlayer />
      <MobileNavigation activeTab="home" onTabChange={() => router.push("/mobile")} />
    </div>
  );
}
