import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and api routes through
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for session cookie (set when user "logs in" via localStorage simulation)
  // In this frontend-first implementation, we allow all routes and rely on client-side guards
  // The session cookie 'shelter_session' is set by the auth page on sign-in
  const session = request.cookies.get('shelter_session');

  // For now, allow access — the auth page sets the cookie on login
  // In a full implementation, we'd redirect to /auth if !session
  if (!session && pathname !== '/') {
    // Uncomment below to enforce auth redirect once real auth is wired:
    // return NextResponse.redirect(new URL('/auth', request.url));
  }

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
