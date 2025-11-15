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
      console.log('[Auth] signIn callback triggered');
      console.log('[Auth] User:', { email: user.email, name: user.name, image: user.image });
      console.log('[Auth] Account provider:', account?.provider);
      console.log('[Auth] Profile:', profile);

      try {
        if (!user.email) {
          console.error('[Auth] No email found in user object');
          return false;
        }

        console.log('[Auth] Updating user photo for:', user.email);
        // Update user's photo URL using service layer
        await updateUserPhoto(user.email, user.image || null);
        console.log('[Auth] User photo updated successfully');

        return true;
      } catch (error) {
        console.error('[Auth] Error in signIn callback:', error);
        return true; // Still allow sign in even if photo update fails
      }
    },
    async session({ session, token }) {
      console.log('[Auth] session callback triggered');
      console.log('[Auth] Session:', { email: session.user?.email, name: session.user?.name });
      console.log('[Auth] Token:', token);
      // Email is used as the user ID throughout the app
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[Auth] redirect callback triggered');
      console.log('[Auth] URL:', url);
      console.log('[Auth] Base URL:', baseUrl);

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log('[Auth] Redirecting to relative URL:', `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        console.log('[Auth] Redirecting to same origin URL:', url);
        return url;
      }
      console.log('[Auth] Redirecting to base URL:', baseUrl);
      return baseUrl;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
  },
};
