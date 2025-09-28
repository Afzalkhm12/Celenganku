import NextAuth, { Session, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from './lib/prisma';
import bcrypt from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session { user: { id: string } & User; }
  interface User { id: string; }
}

declare module 'next-auth/jwt' {
  interface JWT { id: string; }
}

export const config: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      async authorize(credentials) {
        if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password_hash) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (isPasswordValid) return { id: user.id, name: user.name, email: user.email };
        return null;
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);