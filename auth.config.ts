import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        (token as any).provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).provider = (token as any).provider;
      return session;
    },
  },
};

export default authConfig;


