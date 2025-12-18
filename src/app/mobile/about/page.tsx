"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Heart } from "lucide-react";
import ALMusikLogo from "@/components/almusik-logo";

export default function MobileAboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-[#121212] px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Tentang</h1>
      </header>

      <div className="px-4 py-6">
        {/* Logo & Version */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#169c46] rounded-2xl flex items-center justify-center mb-4">
            <ALMusikLogo size={40} />
          </div>
          <h2 className="text-white text-2xl font-bold">ALMusik</h2>
          <p className="text-[#b3b3b3] text-sm">Versi 1.0.0</p>
        </div>

        {/* Description */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <p className="text-[#b3b3b3] text-sm leading-relaxed">
            ALMusik adalah aplikasi streaming musik yang memberikan akses ke jutaan lagu. 
            Dengarkan musik favoritmu kapan saja, di mana saja.
          </p>
        </div>

        {/* Links */}
        <div className="bg-[#1a1a1a] rounded-lg overflow-hidden mb-6">
          <Link
            href="/mobile/help"
            className="flex items-center justify-between px-4 py-3 border-b border-[#282828] hover:bg-[#282828] transition-colors"
          >
            <span className="text-white text-sm">Pusat Bantuan</span>
            <ExternalLink size={16} className="text-[#b3b3b3]" />
          </Link>
          <Link
            href="#"
            className="flex items-center justify-between px-4 py-3 border-b border-[#282828] hover:bg-[#282828] transition-colors"
          >
            <span className="text-white text-sm">Syarat & Ketentuan</span>
            <ExternalLink size={16} className="text-[#b3b3b3]" />
          </Link>
          <Link
            href="#"
            className="flex items-center justify-between px-4 py-3 border-b border-[#282828] hover:bg-[#282828] transition-colors"
          >
            <span className="text-white text-sm">Kebijakan Privasi</span>
            <ExternalLink size={16} className="text-[#b3b3b3]" />
          </Link>
          <Link
            href="#"
            className="flex items-center justify-between px-4 py-3 hover:bg-[#282828] transition-colors"
          >
            <span className="text-white text-sm">Lisensi Open Source</span>
            <ExternalLink size={16} className="text-[#b3b3b3]" />
          </Link>
        </div>

        {/* Credits */}
        <div className="text-center">
          <p className="text-[#535353] text-xs mb-2">
            Dibuat dengan <Heart size={12} className="inline text-red-500" fill="currentColor" /> di Indonesia
          </p>
          <p className="text-[#535353] text-xs">
            © 2024 ALMusik. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
