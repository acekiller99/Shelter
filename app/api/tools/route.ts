import { NextRequest, NextResponse } from 'next/server';
import { tools, type Tool } from '../store';

export type { Tool };

let nextId = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q    = searchParams.get('q')?.toLowerCase();
  const tag  = searchParams.get('tag');
  const sort = searchParams.get('sort') ?? 'newest';

  let result = [...tools];
  if (q)   result = result.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  if (tag) result = result.filter(t => t.tags.map(s => s.toLowerCase()).includes(tag.toLowerCase()));

  if (sort === 'newest')    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sort === 'popular') result.sort((a, b) => b.upvotes.length - a.upvotes.length);
  else if (sort === 'alpha')   result.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, url, author, tags, authorId } = body;

  if (!name || !url) return NextResponse.json({ error: 'name and url are required' }, { status: 400 });

  const tool: Tool = {
    id: `t${++nextId}`,
    name, description: description ?? '', url,
    author: author ?? 'Unknown',
    tags: Array.isArray(tags) ? tags : (tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
    upvotes: [], favorites: [],
    createdAt: new Date().toISOString(),
    authorId: authorId ?? 'u0',
  };

  tools.push(tool);
  return NextResponse.json(tool, { status: 201 });
}
