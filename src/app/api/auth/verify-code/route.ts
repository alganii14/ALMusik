import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// CORS headers for mobile app
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const CODES_PATH = path.join(process.cwd(), "tmp", "verification-codes.json");

async function getCodes(): Promise<Record<string, { code: string; expires: number }>> {
  try {
    const data = await fs.readFile(CODES_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email dan kode diperlukan" }, { status: 400 });
    }

    const codes = await getCodes();
    const stored = codes[email];

    if (!stored) {
      return NextResponse.json({ error: "Kode tidak ditemukan. Silakan minta kode baru." }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      return NextResponse.json({ error: "Kode sudah kadaluarsa. Silakan minta kode baru." }, { status: 400 });
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "Kode verifikasi salah" }, { status: 400 });
    }

    // Code is valid - remove it
    delete codes[email];
    await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2));

    return NextResponse.json({ success: true, verified: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi kode" }, { status: 500, headers: corsHeaders });
  }
}
