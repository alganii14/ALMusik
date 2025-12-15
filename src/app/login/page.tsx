"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Disc, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      router.push("/");
    } else {
      setError("Invalid email or password");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col">
      <header className="flex justify-center py-8">
        <Link href="/" className="flex items-center gap-2">
          <Disc className="h-10 w-10 text-white" fill="currentColor" />
          <span className="text-2xl font-bold text-white">ALMusik</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[400px] bg-[#121212] rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Log in to ALMusik
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                Email or username
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or username"
                className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a7a7a7] hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="#" className="text-white hover:text-[#1DB954] underline text-sm">
              Forgot your password?
            </Link>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#292929]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#121212] text-[#a7a7a7]">or</span>
            </div>
          </div>

          <p className="text-center text-[#a7a7a7]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:text-[#1DB954] underline font-bold">
              Sign up for ALMusik
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
