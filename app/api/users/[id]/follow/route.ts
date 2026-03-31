import { NextRequest, NextResponse } from 'next/server';
import { users } from '../../../store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await params;
  const { followerId } = await req.json();

  if (!followerId) return NextResponse.json({ error: 'followerId required' }, { status: 400 });

  const target = users.find(u => u.id === targetId);
  const follower = users.find(u => u.id === followerId);
  if (!target || !follower) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const isFollowing = target.followers.includes(followerId);

  if (isFollowing) {
    target.followers = target.followers.filter(id => id !== followerId);
    follower.following = follower.following.filter(id => id !== targetId);
  } else {
    target.followers.push(followerId);
    follower.following.push(targetId);
  }

  return NextResponse.json({ following: !isFollowing, followerCount: target.followers.length });
}
