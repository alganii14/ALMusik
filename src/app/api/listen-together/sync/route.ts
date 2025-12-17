import { NextRequest, NextResponse } from "next/server";
import { sessionStorage } from "@/lib/listen-together-storage";

// POST - Sync playback state (host only)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sessionId, userId, action, payload } = body;

  const session = await sessionStorage.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Only host can control playback
  if (session.hostId !== userId) {
    return NextResponse.json({ error: "Only host can control playback" }, { status: 403 });
  }

  switch (action) {
    case "play":
      session.isPlaying = true;
      if (payload?.time !== undefined) {
        session.currentTime = payload.time;
      }
      break;
    case "pause":
      session.isPlaying = false;
      if (payload?.time !== undefined) {
        session.currentTime = payload.time;
      }
      break;
    case "seek":
      if (payload?.time !== undefined) {
        session.currentTime = payload.time;
      }
      break;
    case "change_track":
      if (payload?.track) {
        session.currentTrack = payload.track;
        session.currentTime = 0;
        session.isPlaying = true;
      }
      break;
    case "update_time":
      if (payload?.time !== undefined) {
        session.currentTime = payload.time;
      }
      break;
  }

  session.updatedAt = Date.now();
  await sessionStorage.set(sessionId, session);
  return NextResponse.json(session);
}

// GET - Poll for current state (for listeners)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const session = await sessionStorage.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Return with no-cache headers to ensure fresh data
  return NextResponse.json({
    currentTrack: session.currentTrack,
    isPlaying: session.isPlaying,
    currentTime: session.currentTime,
    participants: session.participants,
    updatedAt: session.updatedAt,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    }
  });
}
