"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";

interface FavoritesContextType {
  favorites: string[]; // Array of song IDs
  isFavorite: (songId: string) => boolean;
  toggleFavorite: (songId: string) => void;
  addFavorite: (songId: string) => void;
  removeFavorite: (songId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage when user changes
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`almusik_favorites_${user.id}`);
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Save favorites to localStorage
  useEffect(() => {
    if (user && favorites.length >= 0) {
      localStorage.setItem(`almusik_favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const isFavorite = (songId: string) => favorites.includes(songId);

  const toggleFavorite = (songId: string) => {
    if (isFavorite(songId)) {
      removeFavorite(songId);
    } else {
      addFavorite(songId);
    }
  };

  const addFavorite = (songId: string) => {
    if (!favorites.includes(songId)) {
      setFavorites((prev) => [songId, ...prev]);
    }
  };

  const removeFavorite = (songId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== songId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
