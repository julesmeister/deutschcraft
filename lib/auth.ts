import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { updateUserPhoto } from './services/userService';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;

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
  },
  pages: {
    signIn: '/',
  },
};
