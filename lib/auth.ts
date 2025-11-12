import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

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

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.email);
        const userSnapshot = await getDoc(userDocRef);

        // Update photoURL if user exists
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          // Only update photoURL if it's different (to avoid unnecessary writes)
          if (userData.photoURL !== user.image) {
            await setDoc(userDocRef, {
              photoURL: user.image || null,
              updatedAt: Date.now(),
            }, { merge: true });
          }
        }

        return true;
      } catch (error) {
        console.error('[Auth] Error in signIn callback:', error);
        return true; // Still allow sign in even if Firestore update fails
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
