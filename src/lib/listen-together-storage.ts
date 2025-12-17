import { ListenTogetherSession } from "@/types/listen-together";
import { kv } from "@vercel/kv";

const SESSION_PREFIX = "listen-together:";
const SESSION_TTL = 2 * 60 * 60; // 2 hours in seconds

// Check if KV is available (has env vars configured) - check each time
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Fallback in-memory storage for development
declare global {
  // eslint-disable-next-line no-var
  var listenTogetherSessions: Map<string, ListenTogetherSession> | undefined;
}

function getSessionsMap(): Map<string, ListenTogetherSession> {
  if (!globalThis.listenTogetherSessions) {
    globalThis.listenTogetherSessions = new Map<string, ListenTogetherSession>();
  }
  return globalThis.listenTogetherSessions;
}

class SessionStorage {
  async get(id: string): Promise<ListenTogetherSession | null> {
    if (isKVAvailable()) {
      try {
        const result = await kv.get<ListenTogetherSession>(`${SESSION_PREFIX}${id}`);
        console.log(`[KV] GET ${id}:`, result ? 'found' : 'not found');
        return result;
      } catch (error) {
        console.error("KV get error:", error);
        return null;
      }
    }
    console.log(`[Memory] GET ${id}`);
    return getSessionsMap().get(id) || null;
  }

  async set(id: string, session: ListenTogetherSession): Promise<void> {
    if (isKVAvailable()) {
      try {
        await kv.set(`${SESSION_PREFIX}${id}`, session, { ex: SESSION_TTL });
        console.log(`[KV] SET ${id}: ${session.participants.length} participants`);
      } catch (error) {
        console.error("KV set error:", error);
      }
    } else {
      console.log(`[Memory] SET ${id}`);
      getSessionsMap().set(id, session);
    }
  }

  async delete(id: string): Promise<boolean> {
    if (isKVAvailable()) {
      try {
        await kv.del(`${SESSION_PREFIX}${id}`);
        console.log(`[KV] DELETE ${id}`);
        return true;
      } catch (error) {
        console.error("KV delete error:", error);
        return false;
      }
    }
    console.log(`[Memory] DELETE ${id}`);
    return getSessionsMap().delete(id);
  }

  async getAll(): Promise<ListenTogetherSession[]> {
    if (isKVAvailable()) {
      try {
        const keys = await kv.keys(`${SESSION_PREFIX}*`);
        if (keys.length === 0) return [];
        const sessions = await Promise.all(
          keys.map(key => kv.get<ListenTogetherSession>(key))
        );
        return sessions.filter((s): s is ListenTogetherSession => s !== null);
      } catch (error) {
        console.error("KV getAll error:", error);
        return [];
      }
    }
    return Array.from(getSessionsMap().values());
  }

  // Cleanup is handled by TTL in KV, but keep for in-memory fallback
  cleanup(): void {
    if (!isKVAvailable()) {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const sessions = getSessionsMap();
      for (const [id, session] of sessions.entries()) {
        if (session.updatedAt < twoHoursAgo) {
          sessions.delete(id);
        }
      }
    }
  }
}

// Singleton instance
export const sessionStorage = new SessionStorage();

// Generate random session code
export function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
