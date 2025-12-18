"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Music } from "lucide-react";
import ALMusikLogo from "@/components/almusik-logo";
import { useAuth } from "@/context/auth-context";

export default function MobileLoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/mobile");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Masukkan email dan password");
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      router.push("/mobile");
    } else {
      setError("Email atau password salah");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1DB954] via-[#121212] to-[#121212] max-w-md mx-auto flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-12 pb-8">
        <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center mb-6">
          <ALMusikLogo size={48} />
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">ALMusik</h1>
        <p className="text-white/80 text-center">
          Jutaan lagu gratis. Dengarkan kapan saja, di mana saja.
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-[#121212] rounded-t-3xl px-6 py-8">
        <h2 className="text-white text-xl font-bold mb-6 text-center">
          Masuk ke Akun
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-[#282828] border border-transparent rounded-lg text-white placeholder-[#727272] focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 bg-[#282828] border border-transparent rounded-lg text-white placeholder-[#727272] focus:outline-none focus:border-[#1DB954] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Link
            href="/forgot-password"
            className="block text-right text-sm text-[#b3b3b3] hover:text-[#1DB954]"
          >
            Lupa password?
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all disabled:opacity-50"
          >
            {isLoading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#282828]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#121212] text-[#727272]">atau</span>
          </div>
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full py-3 bg-transparent border border-[#535353] text-white font-medium rounded-full transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-[#b3b3b3] mt-6 text-sm">
          Belum punya akun?{" "}
          <Link
            href="/mobile/signup"
            className="text-[#1DB954] font-bold hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
