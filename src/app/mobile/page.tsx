"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/mobile-header";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import MobileHome from "@/components/mobile/mobile-home";
import MobileSearch from "@/components/mobile/mobile-search";
import MobileLibrary from "@/components/mobile/mobile-library";
import MobilePlayer from "@/components/mobile/mobile-player";
import { usePlayer } from "@/context/player-context";
import { useAuth } from "@/context/auth-context";

type Tab = "home" | "search" | "library";

export default function MobilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { currentTrack } = usePlayer();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/mobile/login");
    }
  }, [user, isLoading, router]);

  // Calculate bottom padding based on whether player is showing
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] max-w-md mx-auto flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative flex flex-col">
      <MobileHeader />
      
      <main className={`flex-1 overflow-y-auto ${bottomPadding}`}>
        {activeTab === "home" && <MobileHome />}
        {activeTab === "search" && <MobileSearch />}
        {activeTab === "library" && <MobileLibrary />}
      </main>

      <MobilePlayer />
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
