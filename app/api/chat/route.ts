import { NextRequest, NextResponse } from 'next/server';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachment?: { type: 'image' | 'file'; url: string; name: string };
  read: boolean;
  createdAt: string;
}

// roomId → messages
const rooms: Record<string, ChatMessage[]> = {
  'u1-u2': [
    { id: 'm1', roomId: 'u1-u2', senderId: 'u2', senderName: 'Sarah', text: 'Hey, how are you doing?',   read: true,  createdAt: new Date(Date.now() - 600_000).toISOString() },
    { id: 'm2', roomId: 'u1-u2', senderId: 'u1', senderName: 'You',   text: "Doing great! You?",         read: true,  createdAt: new Date(Date.now() - 300_000).toISOString() },
  ],
};

let nextId = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const limit  = Number(searchParams.get('limit') ?? '50');

  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });

  const msgs = (rooms[roomId] ?? []).slice(-limit);
  return NextResponse.json(msgs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, senderId, senderName, text, attachment } = body;

  if (!roomId || !senderId || !text?.trim()) {
    return NextResponse.json({ error: 'roomId, senderId, and text are required' }, { status: 400 });
  }

  const msg: ChatMessage = {
    id: `m${++nextId}`,
    roomId,
    senderId,
    senderName: senderName ?? 'Unknown',
    text: text.trim(),
    attachment,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (!rooms[roomId]) rooms[roomId] = [];
  rooms[roomId].push(msg);

  return NextResponse.json(msg, { status: 201 });
}

// Mark messages as read
export async function PATCH(req: NextRequest) {
  const { roomId, readerId } = await req.json();
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  if (rooms[roomId]) {
    rooms[roomId] = rooms[roomId].map(m =>
      m.senderId !== readerId ? { ...m, read: true } : m
    );
  }
  return NextResponse.json({ success: true });
}
