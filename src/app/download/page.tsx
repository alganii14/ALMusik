"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  ArrowLeft,
  Share,
  Plus,
  Chrome,
  Apple
} from "lucide-react";
import ALMusikLogo from "@/components/almusik-logo";

export default function DownloadPage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
    
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#121212]">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4">
        <Link href="/" className="text-white">
          <ArrowLeft size={24} />
        </Link>
        <ALMusikLogo size={32} />
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-[#1DB954] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ALMusikLogo size={48} />
          </div>
          <h1 className="text-white text-3xl font-bold mb-3">Download ALMusik</h1>
          <p className="text-[#b3b3b3] text-lg">
            Dengarkan jutaan lagu gratis di HP kamu
          </p>
        </div>

        {isStandalone ? (
          /* Already Installed */
          <div className="bg-[#282828] rounded-2xl p-6 text-center mb-8">
            <CheckCircle size={48} className="text-[#1DB954] mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Sudah Terinstall!</h2>
            <p className="text-[#b3b3b3] mb-4">
              ALMusik sudah ada di perangkat kamu
            </p>
            <Link
              href="/mobile"
              className="inline-block bg-[#1DB954] text-black font-bold px-8 py-3 rounded-full hover:bg-[#1ed760] transition-colors"
            >
              Buka Aplikasi
            </Link>
          </div>
        ) : (
          <>
            {/* Install Button */}
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full bg-[#1DB954] text-black font-bold py-4 rounded-full flex items-center justify-center gap-3 hover:bg-[#1ed760] transition-colors mb-6"
              >
                <Download size={24} />
                Install Sekarang
              </button>
            )}

            {/* Platform Instructions */}
            <div className="space-y-4">
              {/* Android */}
              <div className="bg-[#282828] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#3DDC84]/20 rounded-full flex items-center justify-center">
                    <Smartphone size={20} className="text-[#3DDC84]" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Android</h3>
                </div>
                <ol className="space-y-3 text-[#b3b3b3] text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>Buka menu browser (titik tiga di pojok kanan)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <span>Pilih &quot;Install app&quot; atau &quot;Add to Home screen&quot;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <span>Tap &quot;Install&quot; untuk konfirmasi</span>
                  </li>
                </ol>
              </div>

              {/* iOS */}
              <div className="bg-[#282828] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Apple size={20} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">iPhone / iPad</h3>
                </div>
                <ol className="space-y-3 text-[#b3b3b3] text-sm">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <span>Buka di Safari (wajib Safari)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <div className="flex items-center gap-1">
                      <span>Tap tombol Share</span>
                      <Share size={14} className="text-[#007AFF]" />
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <div className="flex items-center gap-1">
                      <span>Pilih &quot;Add to Home Screen&quot;</span>
                      <Plus size={14} className="text-[#007AFF]" />
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </>
        )}

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-white text-xl font-bold mb-6 text-center">Fitur Aplikasi</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🎵", title: "Streaming Gratis", desc: "Jutaan lagu" },
              { icon: "📱", title: "Offline Mode", desc: "Tanpa internet" },
              { icon: "🎧", title: "Audio HD", desc: "Kualitas tinggi" },
              { icon: "📝", title: "Lirik", desc: "Sync dengan lagu" },
            ].map((feature) => (
              <div key={feature.title} className="bg-[#282828] rounded-xl p-4 text-center">
                <span className="text-3xl mb-2 block">{feature.icon}</span>
                <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                <p className="text-[#b3b3b3] text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Mobile Version */}
        <div className="mt-8 text-center">
          <Link
            href="/mobile"
            className="text-[#1DB954] font-medium hover:underline"
          >
            Atau buka versi web mobile →
          </Link>
        </div>
      </main>
    </div>
  );
}
