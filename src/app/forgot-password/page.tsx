"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";
import ALMusikLogo from "@/components/almusik-logo";

type Step = "email" | "code" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Masukkan email Anda");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("code");
      } else {
        setError(data.error || "Gagal mengirim kode");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "code") {
      if (code.length !== 6) {
        setError("Masukkan kode 6 digit");
        return;
      }
      setStep("password");
      return;
    }

    if (step === "password") {
      if (newPassword.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Password tidak cocok");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        });

        const data = await res.json();

        if (res.ok) {
          setStep("success");
        } else {
          setError(data.error || "Gagal mereset password");
          if (data.error?.includes("Kode")) {
            setStep("code");
          }
        }
      } catch {
        setError("Terjadi kesalahan. Coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setCode("");
        setError("");
        alert("Kode baru telah dikirim ke email Anda");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengirim ulang kode");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex flex-col overflow-hidden">
      <header className="flex justify-center py-4">
        <Link href="/">
          <ALMusikLogo size={40} />
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-4 overflow-auto">
        <div className="w-full max-w-[400px] bg-[#121212] rounded-lg p-6">
          {step !== "success" && (
            <button
              onClick={() => {
                if (step === "email") router.push("/login");
                else if (step === "code") setStep("email");
                else if (step === "password") setStep("code");
              }}
              className="flex items-center gap-2 text-[#a7a7a7] hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Kembali</span>
            </button>
          )}

          {step === "success" ? (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle size={64} className="text-[#1DB954]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Password Berhasil Direset!
              </h1>
              <p className="text-[#a7a7a7] mb-8">
                Password Anda telah berhasil diubah. Silakan login dengan password baru.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all hover:scale-105"
              >
                Masuk Sekarang
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                {step === "email" && <Mail size={48} className="text-[#1DB954]" />}
                {step === "code" && <KeyRound size={48} className="text-[#1DB954]" />}
                {step === "password" && <KeyRound size={48} className="text-[#1DB954]" />}
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                {step === "email" && "Lupa Password?"}
                {step === "code" && "Masukkan Kode"}
                {step === "password" && "Buat Password Baru"}
              </h1>

              <p className="text-[#a7a7a7] text-center mb-6">
                {step === "email" && "Masukkan email Anda untuk menerima kode reset password"}
                {step === "code" && `Masukkan kode 6 digit yang dikirim ke ${email}`}
                {step === "password" && "Buat password baru untuk akun Anda"}
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={step === "email" ? handleSendCode : handleVerifyAndReset} className="space-y-4">
                {step === "email" && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email Anda"
                      className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                      autoFocus
                    />
                  </div>
                )}

                {step === "code" && (
                  <div>
                    <label htmlFor="code" className="block text-sm font-bold text-white mb-2">
                      Kode Verifikasi
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white text-center text-2xl tracking-[0.5em] placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                      autoFocus
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="w-full mt-3 text-[#1DB954] hover:text-[#1ed760] text-sm font-medium"
                    >
                      Kirim ulang kode
                    </button>
                  </div>
                )}

                {step === "password" && (
                  <>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-bold text-white mb-2">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-4 py-3 pr-12 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                          autoFocus
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
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-bold text-white mb-2">
                        Konfirmasi Password
                      </label>
                      <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full px-4 py-3 bg-[#121212] border border-[#727272] rounded-md text-white placeholder-[#a7a7a7] focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isLoading ? "Memproses..." : 
                    step === "email" ? "Kirim Kode" :
                    step === "code" ? "Verifikasi" :
                    "Reset Password"
                  }
                </button>
              </form>
            </>
          )}

          {step === "email" && (
            <p className="text-center text-[#a7a7a7] mt-6">
              Ingat password?{" "}
              <Link href="/login" className="text-white hover:text-[#1DB954] underline font-bold">
                Masuk
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
