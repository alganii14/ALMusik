import { NextRequest, NextResponse } from "next/server";
import { ListenTogetherSession, Participant } from "@/types/listen-together";
import { sessionStorage, generateSessionCode } from "@/lib/listen-together-storage";

// GET - Get session info or list user's sessions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const userId = searchParams.get("userId");

  sessionStorage.cleanup();

  if (sessionId) {
    const session = await sessionStorage.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  if (userId) {
    const allSessions = await sessionStorage.getAll();
    const userSessions = allSessions.filter(
      (s) => s.hostId === userId || s.participants.some((p) => p.id === userId)
    );
    return NextResponse.json(userSessions);
  }

  return NextResponse.json({ error: "Missing sessionId or userId" }, { status: 400 });
}

// POST - Create new session or join existing
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, sessionId, userId, userName, userAvatar } = body;

  sessionStorage.cleanup();

  if (action === "create") {
    const newSessionId = generateSessionCode();
    const newSession: ListenTogetherSession = {
      id: newSessionId,
      hostId: userId,
      hostName: userName,
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      participants: [
        {
          id: userId,
          name: userName,
          avatar: userAvatar,
          joinedAt: Date.now(),
          isHost: true,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await sessionStorage.set(newSessionId, newSession);
    return NextResponse.json(newSession);
  }

  if (action === "join") {
    const session = await sessionStorage.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if user already in session
    const existingParticipant = session.participants.find((p) => p.id === userId);
    if (!existingParticipant) {
      const newParticipant: Participant = {
        id: userId,
        name: userName,
        avatar: userAvatar,
        joinedAt: Date.now(),
        isHost: false,
      };
      session.participants.push(newParticipant);
      session.updatedAt = Date.now();
    }

    await sessionStorage.set(sessionId, session);
    return NextResponse.json(session);
  }

  if (action === "leave") {
    const session = await sessionStorage.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    session.participants = session.participants.filter((p) => p.id !== userId);
    session.updatedAt = Date.now();

    // If host leaves, transfer to next participant or delete session
    if (session.hostId === userId) {
      if (session.participants.length > 0) {
        session.hostId = session.participants[0].id;
        session.hostName = session.participants[0].name;
        session.participants[0].isHost = true;
        await sessionStorage.set(sessionId, session);
      } else {
        await sessionStorage.delete(sessionId);
        return NextResponse.json({ message: "Session ended" });
      }
    } else {
      await sessionStorage.set(sessionId, session);
    }

    return NextResponse.json(session);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
