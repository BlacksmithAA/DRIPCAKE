// Helpers de NextAuth con credenciales y roles

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  // No usamos adapter de Prisma porque manejamos sesión vía JWT y nuestros propios passwords
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario) return null;
        if (!usuario.activo) return null;

        const ok = await bcrypt.compare(credentials.password, usuario.passwordHash);
        if (!ok) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.rol = (user as any).rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).rol = token.rol;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
