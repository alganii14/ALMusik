"use client";

import NavigationHeader from "@/components/sections/navigation-header";
import SidebarLibrary from "@/components/sections/sidebar-library";
import TrendingSongsCarousel from "@/components/sections/trending-songs-carousel";
import QuickPicksSection from "@/components/sections/quick-picks-section";
import PlayerControls from "@/components/sections/player-controls";


export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] overflow-hidden">
      <NavigationHeader />

      <div className="flex pt-[64px] pb-[180px]">
        <aside className="hidden lg:block w-[300px] h-[calc(100vh-64px-180px)] fixed left-0 top-[64px] p-2">
          <SidebarLibrary />
        </aside>

        <main className="flex-1 lg:ml-[300px] overflow-y-auto h-[calc(100vh-64px-180px)] bg-[#121212] rounded-lg mx-2 lg:mx-0 lg:mr-2">
          <div className="bg-gradient-to-b from-[#5c3d6e] via-[#2a1a35] to-[#121212] min-h-full">
            <div className="px-6 py-6 space-y-8">
              <QuickPicksSection />
              <TrendingSongsCarousel />
            </div>
          </div>
        </main>
      </div>


      <div className="pb-[72px]">
        <PlayerControls />
      </div>
    </div>
  );
}
