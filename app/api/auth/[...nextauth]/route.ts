import NextAuth from 'next-auth';
import { authOptions } from '@/auth';

// Prevent Next.js from attempting static pre-render of auth endpoints
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
