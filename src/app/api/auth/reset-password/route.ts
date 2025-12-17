import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const RESET_CODE_PREFIX = "reset-code:";
const USERS_PREFIX = "user:";

// Check if KV is available
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Fallback in-memory storage
declare global {
  // eslint-disable-next-line no-var
  var resetCodes: Map<string, { code: string; expires: number }> | undefined;
  // eslint-disable-next-line no-var
  var users: Map<string, { id: string; email: string; password: string; name: string }> | undefined;
}

function getResetCodesMap(): Map<string, { code: string; expires: number }> {
  if (!globalThis.resetCodes) {
    globalThis.resetCodes = new Map();
  }
  return globalThis.resetCodes;
}

function getUsersMap(): Map<string, { id: string; email: string; password: string; name: string }> {
  if (!globalThis.users) {
    globalThis.users = new Map();
  }
  return globalThis.users;
}

interface ResetCodeData {
  code: string;
  expires: number;
}

interface UserData {
  id: string;
  email: string;
  password: string;
  name: string;
}

async function getResetCode(email: string): Promise<ResetCodeData | null> {
  if (isKVAvailable()) {
    try {
      return await kv.get<ResetCodeData>(`${RESET_CODE_PREFIX}${email}`);
    } catch (error) {
      console.error("KV get reset code error:", error);
      return null;
    }
  }
  return getResetCodesMap().get(email) || null;
}

async function deleteResetCode(email: string): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.del(`${RESET_CODE_PREFIX}${email}`);
    } catch (error) {
      console.error("KV delete reset code error:", error);
    }
  } else {
    getResetCodesMap().delete(email);
  }
}

async function getUser(email: string): Promise<UserData | null> {
  if (isKVAvailable()) {
    try {
      return await kv.get<UserData>(`${USERS_PREFIX}${email}`);
    } catch (error) {
      console.error("KV get user error:", error);
      return null;
    }
  }
  return getUsersMap().get(email) || null;
}

async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  if (isKVAvailable()) {
    try {
      const user = await kv.get<UserData>(`${USERS_PREFIX}${email}`);
      if (!user) return false;
      
      user.password = newPassword;
      await kv.set(`${USERS_PREFIX}${email}`, user);
      return true;
    } catch (error) {
      console.error("KV update password error:", error);
      return false;
    }
  } else {
    const user = getUsersMap().get(email);
    if (!user) return false;
    
    user.password = newPassword;
    getUsersMap().set(email, user);
    return true;
  }
}

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, kode, dan password baru diperlukan" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Verify code
    const storedCode = await getResetCode(email);
    
    if (!storedCode) {
      return NextResponse.json({ error: "Kode tidak ditemukan. Silakan minta kode baru." }, { status: 400 });
    }

    if (Date.now() > storedCode.expires) {
      await deleteResetCode(email);
      return NextResponse.json({ error: "Kode sudah kadaluarsa. Silakan minta kode baru." }, { status: 400 });
    }

    if (storedCode.code !== code) {
      return NextResponse.json({ error: "Kode verifikasi salah" }, { status: 400 });
    }

    // Check if user exists
    const user = await getUser(email);
    if (!user) {
      return NextResponse.json({ error: "Email tidak terdaftar" }, { status: 404 });
    }

    // Update password
    const updated = await updateUserPassword(email, newPassword);
    if (!updated) {
      return NextResponse.json({ error: "Gagal mengupdate password" }, { status: 500 });
    }

    // Delete used code
    await deleteResetCode(email);

    return NextResponse.json({ success: true, message: "Password berhasil direset" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Gagal mereset password" }, { status: 500 });
  }
}
