import { NextRequest, NextResponse } from 'next/server';
import { events } from '../../store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find(e => e.id === id);
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  events[idx] = { ...events[idx], ...body };
  return NextResponse.json(events[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  events.splice(idx, 1);
  return NextResponse.json({ success: true });
}
