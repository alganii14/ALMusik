import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
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

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function ensureTmpDir() {
  const tmpDir = path.join(process.cwd(), "tmp");
  try {
    await fs.access(tmpDir);
  } catch {
    await fs.mkdir(tmpDir, { recursive: true });
  }
}

async function getCodes(): Promise<Record<string, { code: string; expires: number }>> {
  try {
    const data = await fs.readFile(CODES_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveCodes(codes: Record<string, { code: string; expires: number }>) {
  await ensureTmpDir();
  await fs.writeFile(CODES_PATH, JSON.stringify(codes, null, 2));
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = generateCode();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code to file
    const codes = await getCodes();
    codes[email] = { code, expires };
    await saveCodes(codes);

    // Send email
    await transporter.sendMail({
      from: `"ALMusik" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Kode Verifikasi ALMusik",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1DB954; text-align: center;">ALMusik</h1>
          <h2 style="text-align: center;">Kode Verifikasi Anda</h2>
          <div style="background: #f5f5f5; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; text-align: center;">Kode ini berlaku selama 10 menit.</p>
          <p style="color: #666; text-align: center;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Kode verifikasi telah dikirim" }, { headers: corsHeaders });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json({ error: "Gagal mengirim kode verifikasi" }, { status: 500, headers: corsHeaders });
  }
}
