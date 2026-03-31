import { NextRequest, NextResponse } from 'next/server';
import { tools } from '../../store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = tools.find(t => t.id === id);
  if (!tool) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tool);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idx = tools.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Toggle upvote
  if (body.action === 'upvote' && body.userId) {
    const has = tools[idx].upvotes.includes(body.userId);
    tools[idx] = { ...tools[idx], upvotes: has ? tools[idx].upvotes.filter(u => u !== body.userId) : [...tools[idx].upvotes, body.userId] };
    return NextResponse.json(tools[idx]);
  }

  // Toggle favorite
  if (body.action === 'favorite' && body.userId) {
    const has = tools[idx].favorites.includes(body.userId);
    tools[idx] = { ...tools[idx], favorites: has ? tools[idx].favorites.filter(u => u !== body.userId) : [...tools[idx].favorites, body.userId] };
    return NextResponse.json(tools[idx]);
  }

  tools[idx] = { ...tools[idx], ...body };
  return NextResponse.json(tools[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await req.json().catch(() => ({}));
  const idx = tools.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (userId && tools[idx].authorId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  tools.splice(idx, 1);
  return NextResponse.json({ success: true });
}
