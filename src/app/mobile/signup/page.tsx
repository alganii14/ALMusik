"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import ALMusikLogo from "@/components/almusik-logo";
import { useAuth } from "@/context/auth-context";

export default function MobileSignupPage() {
  const router = useRouter();
  const { user, signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
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

    if (!name || !email || !password) {
      setError("Lengkapi semua data");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    const success = await signup(email, password, name);

    if (success) {
      router.push("/mobile");
    } else {
      setError("Email sudah terdaftar");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] max-w-md mx-auto flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-white">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-lg font-bold">Buat Akun</h1>
      </header>

      {/* Form */}
      <div className="flex-1 px-6 py-4">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#169c46] rounded-full flex items-center justify-center">
            <ALMusikLogo size={40} />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#b3b3b3] text-sm mb-2">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama"
              className="w-full px-4 py-3 bg-[#282828] border border-transparent rounded-lg text-white placeholder-[#727272] focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#b3b3b3] text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className="w-full px-4 py-3 bg-[#282828] border border-transparent rounded-lg text-white placeholder-[#727272] focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#b3b3b3] text-sm mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all disabled:opacity-50 mt-6"
          >
            {isLoading ? "Mendaftar..." : "Daftar"}
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
          Daftar dengan Google
        </button>

        <p className="text-center text-[#b3b3b3] mt-6 text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/mobile/login"
            className="text-[#1DB954] font-bold hover:underline"
          >
            Masuk
          </Link>
        </p>

        <p className="text-center text-[#535353] text-xs mt-6 px-4">
          Dengan mendaftar, kamu menyetujui Syarat & Ketentuan dan Kebijakan
          Privasi ALMusik.
        </p>
      </div>
    </div>
  );
}
