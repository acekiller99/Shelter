/**
 * NextAuth v4 configuration (auth.ts).
 *
 * Providers:
 *   - GitHub OAuth
 *   - Credentials (email + bcrypt-hashed password)
 *
 * Adapter: Prisma (sessions + accounts stored in PostgreSQL).
 *
 * Usage in Server Components / Route Handlers:
 *   import { getServerSession } from 'next-auth';
 *   import { authOptions } from '@/auth';
 *   const session = await getServerSession(authOptions);
 */

import type { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),

    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],

  session: {
    strategy: 'jwt', // JWT so credential sessions don't require DB per-request
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id =
          token.userId as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth',
  },
};
