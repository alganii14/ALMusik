"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const isLoading = status === "loading";

  // Check for local user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("almusik_user");
    if (savedUser && !session) {
      setLocalUser(JSON.parse(savedUser));
    }
  }, [session]);

  // Combine session user and local user
  const user: User | null = session?.user
    ? {
        id: (session.user as { id?: string }).id || session.user.email || "",
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || undefined,
      }
    : localUser;

  const login = async (email: string, password: string): Promise<boolean> => {
    // Try local auth first
    const users = JSON.parse(localStorage.getItem("almusik_users") || "[]");
    
    // Check if email exists
    const userByEmail = users.find((u: { email: string }) => u.email === email);
    
    if (!userByEmail) {
      // Email not registered
      return false;
    }
    
    // Check password
    if (userByEmail.password !== password) {
      // Wrong password
      return false;
    }

    const userData = { id: userByEmail.id, email: userByEmail.email, name: userByEmail.name };
    setLocalUser(userData);
    localStorage.setItem("almusik_user", JSON.stringify(userData));
    return true;
  };

  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem("almusik_users") || "[]");
    const exists = users.some((u: { email: string }) => u.email === email);

    if (exists) {
      return false;
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
    };

    users.push(newUser);
    localStorage.setItem("almusik_users", JSON.stringify(users));

    const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
    setLocalUser(userData);
    localStorage.setItem("almusik_user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setLocalUser(null);
    localStorage.removeItem("almusik_user");
    if (session) {
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}