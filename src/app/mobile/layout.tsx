"use client";

import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto relative overflow-hidden">
      {children}
    </div>
  );
}
