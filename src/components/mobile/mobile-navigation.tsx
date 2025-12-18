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
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#121212] border-t border-[#282828] z-50">
      <div className="flex items-center justify-around py-2 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1 transition-all ${
                isActive 
                  ? "text-white" 
                  : "text-[#b3b3b3]"
              }`}
            >
              <Icon 
                size={24} 
                fill={isActive ? "currentColor" : "none"}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
