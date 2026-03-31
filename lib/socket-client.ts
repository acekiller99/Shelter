/**
 * Browser-side Socket.io singleton factories.
 * Each namespace has its own socket instance, created lazily on first use.
 *
 * Usage:
 *   const chat = getChatSocket();
 *   chat.connect();
 *   chat.emit('join_room', { roomId, userId });
 *   chat.on('message', (msg) => setMessages(prev => [...prev, msg]));
 */

import { io, Socket } from 'socket.io-client';
import type {
  ServerToClient_Chat,
  ClientToServer_Chat,
  ServerToClient_Presence,
  ClientToServer_Presence,
  ServerToClient_Game,
  ClientToServer_Game,
} from './socket-events';

type ChatSocket = Socket<ServerToClient_Chat, ClientToServer_Chat>;
type PresenceSocket = Socket<ServerToClient_Presence, ClientToServer_Presence>;
type GameSocket = Socket<ServerToClient_Game, ClientToServer_Game>;

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');

const COMMON_OPTS = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
} as const;

let _chat: ChatSocket | null = null;
let _presence: PresenceSocket | null = null;
let _game: GameSocket | null = null;

/** Chat namespace — send/receive messages, typing indicators */
export function getChatSocket(): ChatSocket {
  if (!_chat) {
    _chat = io(`${BASE_URL}/chat`, COMMON_OPTS) as ChatSocket;
  }
  return _chat;
}

/** Presence namespace — online/away/offline status */
export function getPresenceSocket(): PresenceSocket {
  if (!_presence) {
    _presence = io(`${BASE_URL}/presence`, COMMON_OPTS) as PresenceSocket;
  }
  return _presence;
}

/** Game namespace — real-time game state and actions */
export function getGameSocket(): GameSocket {
  if (!_game) {
    _game = io(`${BASE_URL}/game`, COMMON_OPTS) as GameSocket;
  }
  return _game;
}

/** Disconnect and destroy all socket instances (call on sign-out) */
export function disconnectAll(): void {
  _chat?.disconnect();
  _presence?.disconnect();
  _game?.disconnect();
  _chat = null;
  _presence = null;
  _game = null;
}
