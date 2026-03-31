import { NextRequest, NextResponse } from 'next/server';
import { posts, type Post } from '../store';

export type { Post };

let nextId = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q    = searchParams.get('q')?.toLowerCase();
  const user = searchParams.get('userId');
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '10');

  let result = [...posts].filter(p => p.visibility === 'public');
  if (q) result = result.filter(p => p.content.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q));
  if (user) result = result.filter(p => p.author.id === user);

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const total = result.length;
  const paginated = result.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ posts: paginated, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, image, authorId, authorName, authorAvatar, authorUsername, visibility = 'public' } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const post: Post = {
    id: String(++nextId),
    author: { id: authorId ?? 'u0', name: authorName ?? 'Anonymous', avatar: authorAvatar ?? '', username: authorUsername ?? 'anon' },
    content: content.trim(),
    image,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    visibility,
  };

  posts.unshift(post);
  return NextResponse.json(post, { status: 201 });
}
