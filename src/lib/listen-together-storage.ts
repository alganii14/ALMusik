import { ListenTogetherSession } from "@/types/listen-together";

// In-memory storage untuk sessions
// Untuk production, gunakan Redis atau database
class SessionStorage {
  private sessions = new Map<string, ListenTogetherSession>();

  get(id: string): ListenTogetherSession | undefined {
    return this.sessions.get(id);
  }

  set(id: string, session: ListenTogetherSession): void {
    this.sessions.set(id, session);
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  getAll(): ListenTogetherSession[] {
    return Array.from(this.sessions.values());
  }

  // Cleanup sessions older than 2 hours
  cleanup(): void {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [id, session] of this.sessions.entries()) {
      if (session.updatedAt < twoHoursAgo) {
        this.sessions.delete(id);
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
