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
      console.info('[Auth] ========== SIGNIN CALLBACK TRIGGERED ==========');
      console.info('[Auth] User:', { email: user.email, name: user.name, image: user.image });
      console.info('[Auth] Account provider:', account?.provider);
      console.info('[Auth] Profile:', profile);

      try {
        if (!user.email) {
          console.error('[Auth] No email found in user object');
          return false;
        }

        console.info('[Auth] Updating user photo for:', user.email);
        // Update user's photo URL using service layer
        await updateUserPhoto(user.email, user.image || null);
        console.info('[Auth] User photo updated successfully');

        return true;
      } catch (error) {
        console.error('[Auth] Error in signIn callback:', error);
        return true; // Still allow sign in even if photo update fails
      }
    },
    async session({ session, token }) {
      console.info('[Auth] session callback triggered');
      console.info('[Auth] Session:', { email: session.user?.email, name: session.user?.name });
      console.info('[Auth] Token:', token);
      // Email is used as the user ID throughout the app
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.info('[Auth] ========== REDIRECT CALLBACK TRIGGERED ==========');
      console.info('[Auth] URL:', url);
      console.info('[Auth] Base URL:', baseUrl);

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.info('[Auth] Redirecting to relative URL:', `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.info('[Auth] Redirecting to same origin URL:', url);
        return url;
      }
      console.info('[Auth] Redirecting to base URL:', baseUrl);
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
  },
};
