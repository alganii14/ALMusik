"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import ALMusikLogo from "@/components/almusik-logo";
import { useAuth } from "@/context/auth-context";

type Step = "email" | "verify" | "details";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email) {
      setError("Masukkan email terlebih dahulu");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Kode verifikasi telah dikirim ke email Anda");
        setStep("verify");
      } else {
        setError(data.error || "Gagal mengirim kode verifikasi");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!verificationCode) {
      setError("Masukkan kode verifikasi");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        setSuccess("Email terverifikasi!");
        setStep("details");
      } else {
        setError(data.error || "Kode verifikasi salah");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name || !password) {
      setError("Lengkapi semua field");
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
      router.push("/");
    } else {
      setError("Email sudah terdaftar");
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess("Kode verifikasi baru telah dikirim");
      } else {
        setError("Gagal mengirim ulang kode");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col">
      <header className="flex justify-center py-8">
        <Link href="/">
          <ALMusikLogo size={48} />
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-[400px] bg-[#121212] rounded-lg p-8">
          {step !== "email" && (
            <button
              onClick={() => setStep(step === "verify" ? "email" : "verify")}
              className="flex items-center gap-2 text-[#b3b3b3] hover:text-white mb-4"
            >
              <ArrowLeft size={20} />
              <span>Kembali</span>
            </button>
          )}

          <h1 className="text-4xl font-bold text-white text-center mb-8">
            {step === "email" && "Daftar Gratis"}
            {step === "verify" && "Verifikasi Email"}
            {step === "details" && "Lengkapi Profil"}
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-md mb-6 text-sm">
              {success}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                {isLoading ? "Mengirim..." : "Kirim Kode Verifikasi"}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#292929]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#121212] text-[#a7a7a7]">atau</span>
                </div>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-3 bg-transparent border border-[#727272] hover:border-white text-white font-bold rounded-full transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Daftar dengan Google
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-[#b3b3b3] text-center mb-4">
                Kami telah mengirim kode 6 digit ke<br />
                <span className="text-white font-medium">{email}</span>
              </p>

              <div>
                <label htmlFor="code" className="block text-sm font-bold text-white mb-2">
                  Kode Verifikasi
                </label>
                <input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Memverifikasi..." : "Verifikasi"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-[#b3b3b3] hover:text-white text-sm underline"
                >
                  Kirim ulang kode
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Profile Details */}
          {step === "details" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <p className="text-[#b3b3b3] text-center mb-4">
                Email terverifikasi: <span className="text-[#1DB954]">{email}</span>
              </p>

              <div>
                <label htmlFor="name" className="block text-sm font-bold text-white mb-2">
                  Nama Profil
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                  autoFocus
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
                    placeholder="Buat password"
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
                <p className="text-xs text-[#a7a7a7] mt-1">Minimal 6 karakter</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Membuat akun..." : "Daftar"}
              </button>
            </form>
          )}

          <p className="text-center text-[#a7a7a7] mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-white hover:text-[#1DB954] underline font-bold">
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
