"use client";

import { AuthProvider } from "@/context/auth-context";
import { PlayerProvider } from "@/context/player-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PlayerProvider>
        {children}
      </PlayerProvider>
    </AuthProvider>
  );
}
