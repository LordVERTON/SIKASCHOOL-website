import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  ROLE_REDIRECTS,
  type UserRole,
} from '@/lib/constants';

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/auth/signin' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(input) {
        const parsed = credentialsSchema.safeParse(input);
        if (!parsed.success) return null;

        const supabaseAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          },
        );

        const { data, error } = await supabaseAuth.auth.signInWithPassword(parsed.data);
        if (error || !data.user?.email) return null;

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, first_name, last_name, role, is_active')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile?.is_active) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          role: profile.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || '');
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;

      if (isPublicPath(pathname)) {
        if (session?.user && pathname.startsWith('/auth/signin')) {
          const role = session.user.role;
          return Response.redirect(new URL(ROLE_REDIRECTS[role] || '/', request.nextUrl));
        }
        return true;
      }

      if (!session?.user) return false;

      for (const [route, requiredRole] of Object.entries(PROTECTED_ROUTES)) {
        if (!pathname.startsWith(route)) continue;
        const roles = (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) as readonly UserRole[];
        if (!roles.includes(session.user.role)) {
          return Response.redirect(
            new URL(ROLE_REDIRECTS[session.user.role] || '/auth/signin', request.nextUrl),
          );
        }
      }

      return true;
    },
  },
});
