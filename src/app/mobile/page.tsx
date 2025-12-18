"use client";

import { useState } from "react";
import MobileHeader from "@/components/mobile/mobile-header";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import MobileHome from "@/components/mobile/mobile-home";
import MobileSearch from "@/components/mobile/mobile-search";
import MobileLibrary from "@/components/mobile/mobile-library";
import MobilePlayer from "@/components/mobile/mobile-player";
import { usePlayer } from "@/context/player-context";

type Tab = "home" | "search" | "library";

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { currentTrack } = usePlayer();

  // Calculate bottom padding based on whether player is showing
  const bottomPadding = currentTrack ? "pb-[130px]" : "pb-[70px]";

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
