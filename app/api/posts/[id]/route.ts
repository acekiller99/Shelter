import { NextRequest, NextResponse } from 'next/server';
import { posts } from '../../store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = posts.find(p => p.id === id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Toggle like
  if (body.action === 'like' && body.userId) {
    const liked = posts[idx].likes.includes(body.userId);
    posts[idx] = {
      ...posts[idx],
      likes: liked
        ? posts[idx].likes.filter(uid => uid !== body.userId)
        : [...posts[idx].likes, body.userId],
    };
    return NextResponse.json(posts[idx]);
  }

  // Add comment
  if (body.action === 'comment' && body.text) {
    const comment = {
      id: `c${Date.now()}`,
      authorId: body.userId ?? 'u0',
      authorName: body.authorName ?? 'Anonymous',
      text: body.text,
      createdAt: new Date().toISOString(),
    };
    posts[idx] = { ...posts[idx], comments: [...posts[idx].comments, comment] };
    return NextResponse.json(posts[idx]);
  }

  // Edit content
  posts[idx] = { ...posts[idx], ...body };
  return NextResponse.json(posts[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await req.json().catch(() => ({}));
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (userId && posts[idx].author.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  posts.splice(idx, 1);
  return NextResponse.json({ success: true });
}
