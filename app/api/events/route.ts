import { NextRequest, NextResponse } from 'next/server';
import { events, type Event } from '../store';

export type { Event };

let nextId = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const date   = searchParams.get('date');
  const month  = searchParams.get('month'); // YYYY-MM

  let result = [...events];
  if (userId) result = result.filter(e => e.authorId === userId || e.visibility === 'public');
  if (date)   result = result.filter(e => e.date === date);
  if (month)  result = result.filter(e => e.date.startsWith(month));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, date, time, duration, description, type, visibility, authorId, notes, color } = body;

  if (!title || !date || !time) {
    return NextResponse.json({ error: 'title, date and time are required' }, { status: 400 });
  }

  const event: Event = {
    id: `e${++nextId}`,
    title, date, time,
    duration: duration ?? 60,
    description: description ?? '',
    type: type ?? 'other',
    visibility: visibility ?? 'public',
    authorId: authorId ?? 'u0',
    completed: false,
    notes: notes ?? '',
    color: color ?? '#6366f1',
  };

  events.push(event);
  return NextResponse.json(event, { status: 201 });
}
