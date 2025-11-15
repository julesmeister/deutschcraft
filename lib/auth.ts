import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { updateUserPhoto } from './services/userService';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          console.error('[Auth] No email found in user object');
          return false;
        }

        // Update user's photo URL using service layer
        await updateUserPhoto(user.email, user.image || null);

        return true;
      } catch (error) {
        console.error('[Auth] Error in signIn callback:', error);
        return true; // Still allow sign in even if photo update fails
      }
    },
    async session({ session, token }) {
      // Email is used as the user ID throughout the app
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
  },
};
