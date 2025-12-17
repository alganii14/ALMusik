import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { kv } from "@vercel/kv";

const RESET_CODE_PREFIX = "reset-code:";
const CODE_TTL = 10 * 60; // 10 minutes in seconds

// Check if KV is available
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Fallback in-memory storage
declare global {
  // eslint-disable-next-line no-var
  var resetCodes: Map<string, { code: string; expires: number }> | undefined;
}

function getResetCodesMap(): Map<string, { code: string; expires: number }> {
  if (!globalThis.resetCodes) {
    globalThis.resetCodes = new Map();
  }
  return globalThis.resetCodes;
}

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

async function saveResetCode(email: string, code: string): Promise<void> {
  const expires = Date.now() + CODE_TTL * 1000;
  
  if (isKVAvailable()) {
    try {
      await kv.set(`${RESET_CODE_PREFIX}${email}`, { code, expires }, { ex: CODE_TTL });
    } catch (error) {
      console.error("KV save reset code error:", error);
    }
  } else {
    getResetCodesMap().set(email, { code, expires });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = generateCode();
    
    // Save code
    await saveResetCode(email, code);

    // Send email
    await transporter.sendMail({
      from: `"ALMusik" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Password ALMusik",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1DB954; text-align: center;">ALMusik</h1>
          <h2 style="text-align: center;">Reset Password</h2>
          <p style="color: #666; text-align: center;">Gunakan kode berikut untuk mereset password Anda:</p>
          <div style="background: #f5f5f5; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; text-align: center;">Kode ini berlaku selama 10 menit.</p>
          <p style="color: #999; text-align: center; font-size: 12px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Kode reset password telah dikirim ke email Anda" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Gagal mengirim kode reset password" }, { status: 500 });
  }
}
