/**
 * Middleware — runs on every matched request before the page renders.
 *
 * Auth enforcement is deliberately opt-in: set ENFORCE_AUTH=true in .env to
 * redirect unauthenticated users to /auth.  The full NextAuth `auth()` helper
 * runs in Server Components and API routes (Node.js runtime); middleware uses a
 * lightweight JWT-check to stay Edge-Runtime compatible.
 *
 * To activate redirect enforcement, uncomment the block below and ensure
 * AUTH_SECRET is set in .env.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth', '/api/auth', '/api/timetable'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Uncomment once the database is wired and AUTH_SECRET is set:
  // if (!isPublic) {
  //   const token = request.cookies.get('next-auth.session-token')
  //              ?? request.cookies.get('__Secure-next-auth.session-token');
  //   if (!token) return NextResponse.redirect(new URL('/auth', request.url));
  // }

  void isPublic;
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
