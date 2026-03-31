import { NextRequest, NextResponse } from 'next/server';
import { users, User } from '../store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();
  const id = searchParams.get('id');

  if (id) {
    const user = users.find(u => u.id === id);
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { email, ...safeUser } = user;
    void email; // strip email from public response
    return NextResponse.json(safeUser);
  }

  let result: Omit<User, 'email'>[] = users.map(({ email, ...u }) => { void email; return u; });
  if (q) result = result.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  return NextResponse.json(result);
}
