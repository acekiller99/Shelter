/**
 * Custom Next.js + Socket.io HTTP server.
 *
 * Replaces `next dev` / `next start` in local and production environments.
 * Three Socket.io namespaces:
 *   /chat     — real-time messaging
 *   /presence — online/away/offline status
 *   /game     — multiplayer game state
 *
 * Run:
 *   dev:   npm run dev   (uses tsx for hot-reload TypeScript execution)
 *   prod:  npm start     (same binary, NODE_ENV=production)
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type {
  ChatMessagePayload,
  TypingPayload,
  JoinRoomPayload,
  MarkReadPayload,
  PresencePayload,
  GameActionPayload,
  PlayerJoinPayload,
} from './lib/socket-events';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME ?? 'localhost';
const port = parseInt(process.env.PORT ?? '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? `http://${hostname}:${port}`,
      credentials: true,
    },
    // Use long-polling as initial transport then upgrade to WebSocket
    transports: ['polling', 'websocket'],
  });

  // ─────────────────────────────────────────────
  // /chat namespace
  // ─────────────────────────────────────────────

  const chatNs = io.of('/chat');

  chatNs.on('connection', (socket) => {
    console.log(`[chat] connected: ${socket.id}`);

    socket.on('join_room', ({ roomId, userId }: JoinRoomPayload) => {
      socket.join(roomId);
      console.log(`[chat] ${userId} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('message', (msg: Omit<ChatMessagePayload, 'id' | 'createdAt'>) => {
      const full: ChatMessagePayload = {
        ...msg,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
      };
      // Broadcast to everyone in the room (including the sender)
      chatNs.to(msg.roomId).emit('message', full);
    });

    socket.on('typing', (p: TypingPayload) => {
      socket.to(p.roomId).emit('typing', p);
    });

    socket.on('stop_typing', (p: TypingPayload) => {
      socket.to(p.roomId).emit('stop_typing', p);
    });

    socket.on('mark_read', (_p: MarkReadPayload) => {
      // Persist via Prisma here when DB is wired:
      // await prisma.chatMember.update({ where: { userId_roomId: { userId: p.userId, roomId: p.roomId } }, data: { lastRead: new Date() } });
    });

    socket.on('disconnect', () => {
      console.log(`[chat] disconnected: ${socket.id}`);
    });
  });

  // ─────────────────────────────────────────────
  // /presence namespace
  // ─────────────────────────────────────────────

  const presenceNs = io.of('/presence');

  // Map socketId → userId for cleanup on disconnect
  const socketToUser = new Map<string, string>();

  presenceNs.on('connection', (socket) => {
    console.log(`[presence] connected: ${socket.id}`);

    socket.on('user_online', (userId: string) => {
      socketToUser.set(socket.id, userId);
      const update: PresencePayload = { userId, status: 'online' };
      presenceNs.emit('presence_update', update);
      // Send the current online user list back to the newly connected client
      const onlineIds = [...socketToUser.values()];
      socket.emit('online_users', onlineIds);
    });

    socket.on('user_away', (userId: string) => {
      socketToUser.set(socket.id, userId);
      presenceNs.emit('presence_update', { userId, status: 'away' });
    });

    socket.on('disconnect', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        socketToUser.delete(socket.id);
        presenceNs.emit('presence_update', { userId, status: 'offline' });
      }
      console.log(`[presence] disconnected: ${socket.id}`);
    });
  });

  // ─────────────────────────────────────────────
  // /game namespace
  // ─────────────────────────────────────────────

  const gameNs = io.of('/game');

  gameNs.on('connection', (socket) => {
    console.log(`[game] connected: ${socket.id}`);

    socket.on('join_game', (p: PlayerJoinPayload) => {
      socket.join(p.roomId);
      gameNs.to(p.roomId).emit('player_joined', p);
      console.log(`[game] ${p.userId} joined room ${p.roomId}`);
    });

    socket.on('leave_game', (roomId: string) => {
      socket.leave(roomId);
      // Identify user by socket and notify room — full version reads from sessionData
      gameNs.to(roomId).emit('player_left', { roomId, userId: 'unknown' });
    });

    socket.on('game_action', (p: GameActionPayload) => {
      // Broadcast state update to all players in the room.
      // In a full implementation, run game logic here before broadcasting.
      gameNs.to(p.roomId).emit('game_state', {
        roomId: p.roomId,
        state: p.data,
        event: p.action,
      });
    });

    socket.on('ready', ({ roomId, userId }) => {
      console.log(`[game] ${userId} is ready in ${roomId}`);
      // When all players are ready, emit 'game_started'
      // Full impl: check DB / in-memory state, then: gameNs.to(roomId).emit('game_started', { roomId });
    });

    socket.on('disconnect', () => {
      console.log(`[game] disconnected: ${socket.id}`);
    });
  });

  // ─────────────────────────────────────────────
  // Start server
  // ─────────────────────────────────────────────

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port} (${dev ? 'dev' : 'production'})`);
    console.log('> Socket.io namespaces: /chat, /presence, /game');
  });
});
