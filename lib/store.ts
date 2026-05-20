// Global in-memory store shared across hot-reloads in dev and across requests
// within a single Vercel function instance.
// For multi-region / multi-instance production scale, swap this for Upstash Redis.

export const VALID_MOODS = [
  'happy', 'sad', 'lonely', 'romantic', 'bored', 'gaming', 'study',
] as const;

export type Mood = (typeof VALID_MOODS)[number];

export interface Room {
  user1: string;
  user2: string;
  mood: string;
}

interface Store {
  waitingUsers: Record<string, string[]>;
  activeRooms: Record<string, Room>;
  userRoom: Record<string, string>;
  userNicknames: Record<string, string>;
}

const g = global as typeof global & { __vl?: Store };

if (!g.__vl) {
  g.__vl = {
    waitingUsers: Object.fromEntries(VALID_MOODS.map((m) => [m, []])),
    activeRooms: {},
    userRoom: {},
    userNicknames: {},
  };
}

export const store = g.__vl!;
