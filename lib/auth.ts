import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getUserAdmin, upsertUserAdmin } from './services/userServiceAdmin';

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
          return false;
        }

        // Check if user document exists (using Admin SDK)
        const existingUser = await getUserAdmin(user.email);

        if (!existingUser) {
          // New user - create user document with PENDING_APPROVAL role
          const displayName = user.name || user.email.split('@')[0];
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          await upsertUserAdmin({
            email: user.email,
            userId: user.email,
            firstName,
            lastName,
            role: 'PENDING_APPROVAL' as const,
            enrollmentStatus: 'not_submitted' as const,
            photoURL: user.image || null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else {
          // Update photo if changed
          if (existingUser.photoURL !== user.image) {
            await upsertUserAdmin({
              email: user.email,
              photoURL: user.image || null,
            });
          }
        }

        return true;
      } catch (error) {
        // Return true to allow sign in even if Firestore write fails
        // JWT callback will handle fetching the role
        return true;
      }
    },
    async jwt({ token, user, trigger }) {
      try {
        // On sign in, fetch user role from Firestore and store in token (using Admin SDK)
        if (user?.email) {
          const userData = await getUserAdmin(user.email);
          token.role = userData?.role;
          token.enrollmentStatus = userData?.enrollmentStatus;
        }

        // On token refresh (when session is updated), refetch user data
        if (trigger === 'update' && token.email) {
          const userData = await getUserAdmin(token.email as string);
          token.role = userData?.role;
          token.enrollmentStatus = userData?.enrollmentStatus;
        }
      } catch (error) {
        // Don't fail the entire auth flow - just continue without role
        // User will be redirected to settings page by middleware
      }

      return token;
    },
    async session({ session, token }) {
      // Add role and enrollment status to session
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).enrollmentStatus = token.enrollmentStatus;
      }
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
  debug: false,
  pages: {
    signIn: '/',
  },
};
