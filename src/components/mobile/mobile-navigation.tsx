"use client";

import { Home, Search, Library } from "lucide-react";

interface MobileNavigationProps {
  activeTab: "home" | "search" | "library";
  onTabChange: (tab: "home" | "search" | "library") => void;
}

export default function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "search" as const, label: "Cari", icon: Search },
    { id: "library" as const, label: "Library", icon: Library },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gradient-to-t from-black via-black/95 to-transparent pt-4 pb-2 px-4 z-40">
      <div className="flex items-center justify-around bg-[#121212] rounded-full py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all ${
                isActive 
                  ? "text-white" 
                  : "text-[#b3b3b3] hover:text-white"
              }`}
            >
              <Icon 
                size={22} 
                fill={isActive ? "currentColor" : "none"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
