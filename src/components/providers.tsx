"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/auth-context";
import { PlayerProvider } from "@/context/player-context";
import { FavoritesProvider } from "@/context/favorites-context";
import { SongsProvider } from "@/context/songs-context";
import { ListenTogetherProvider } from "@/context/listen-together-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SongsProvider>
          <FavoritesProvider>
            <PlayerProvider>
              <ListenTogetherProvider>
                {children}
              </ListenTogetherProvider>
            </PlayerProvider>
          </FavoritesProvider>
        </SongsProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
