import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Add your admin emails here
const ADMIN_EMAILS = ["saurabhkirve@gmail.com", "sanchanvalse@gmail.com"];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      // Attach role to the session
      if (session.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        (session.user as any).role = "admin";
      } else {
        (session.user as any).role = "user";
      }
      return session;
    },
  },
};