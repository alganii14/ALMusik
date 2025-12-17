"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/auth-context";
import { PlayerProvider } from "@/context/player-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { SongsProvider } from "@/context/songs-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SongsProvider>
          <FavoritesProvider>
            <PlayerProvider>{children}</PlayerProvider>
          </FavoritesProvider>
        </SongsProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
