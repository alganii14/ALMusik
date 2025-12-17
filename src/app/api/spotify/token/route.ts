import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;
  const refreshToken = cookieStore.get("spotify_refresh_token")?.value;

  if (accessToken) {
    return NextResponse.json({ access_token: accessToken });
  }

  if (refreshToken) {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        cookieStore.set("spotify_access_token", data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: data.expires_in,
          path: "/",
        });

        return NextResponse.json({ access_token: data.access_token });
      }
    } catch (error) {
      console.error("Token refresh error:", error);
    }
  }

  return NextResponse.json({ access_token: null }, { status: 401 });
}
