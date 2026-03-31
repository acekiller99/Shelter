/**
 * Shared Socket.io event type definitions.
 * Import on both the server (server.ts) and client (lib/socket-client.ts)
 * to keep event names and payloads in sync.
 */

// ─────────────────────────────────────────────
// Chat namespace (/chat)
// ─────────────────────────────────────────────

export interface ChatMessagePayload {
  id: string;
  roomId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
  fileUrl?: string;
  createdAt: string;
}

export interface TypingPayload {
  roomId: string;
  userId: string;
  userName: string;
}

export interface JoinRoomPayload {
  roomId: string;
  userId: string;
}

export interface MarkReadPayload {
  roomId: string;
  userId: string;
}

export interface ServerToClient_Chat {
  message: (msg: ChatMessagePayload) => void;
  typing: (p: TypingPayload) => void;
  stop_typing: (p: TypingPayload) => void;
  error: (msg: string) => void;
}

export interface ClientToServer_Chat {
  join_room: (p: JoinRoomPayload) => void;
  leave_room: (roomId: string) => void;
  message: (msg: Omit<ChatMessagePayload, 'id' | 'createdAt'>) => void;
  typing: (p: TypingPayload) => void;
  stop_typing: (p: TypingPayload) => void;
  mark_read: (p: MarkReadPayload) => void;
}

// ─────────────────────────────────────────────
// Presence namespace (/presence)
// ─────────────────────────────────────────────

export interface PresencePayload {
  userId: string;
  status: 'online' | 'away' | 'offline';
}

export interface ServerToClient_Presence {
  presence_update: (p: PresencePayload) => void;
  online_users: (userIds: string[]) => void;
}

export interface ClientToServer_Presence {
  user_online: (userId: string) => void;
  user_away: (userId: string) => void;
}

// ─────────────────────────────────────────────
// Game namespace (/game)
// ─────────────────────────────────────────────

export interface GameActionPayload {
  roomId: string;
  userId: string;
  action: string;    // e.g. 'bet', 'fold', 'move', 'attack'
  data: unknown;     // action-specific payload
}

export interface GameStatePayload {
  roomId: string;
  state: unknown;    // full serialized game state
  event: string;     // what triggered the update
}

export interface PlayerJoinPayload {
  roomId: string;
  userId: string;
  userName: string;
  avatar: string;
}

export interface ServerToClient_Game {
  game_state: (p: GameStatePayload) => void;
  player_joined: (p: PlayerJoinPayload) => void;
  player_left: (p: { roomId: string; userId: string }) => void;
  game_started: (p: { roomId: string }) => void;
  game_ended: (p: { roomId: string; winnerId?: string }) => void;
  error: (msg: string) => void;
}

export interface ClientToServer_Game {
  join_game: (p: PlayerJoinPayload) => void;
  leave_game: (roomId: string) => void;
  game_action: (p: GameActionPayload) => void;
  ready: (p: { roomId: string; userId: string }) => void;
}
