'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { syncUserPhotoURL } from '../utils/syncUserPhoto';

/**
 * Syncs NextAuth session with Firebase Auth
 * When user is signed in with NextAuth (Google), also sign them into Firebase
 * This allows Firestore security rules to work with request.auth
 */
export function useFirebaseAuth() {
  const { data: session, status } = useSession();
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    async function syncAuth() {
      if (status === 'loading') return;

      if (session?.user) {
        // User is signed in with NextAuth
        try {
          // Get custom Firebase token from API
          const response = await fetch('/api/auth/firebase-token', {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to get Firebase token');
          }

          const { token } = await response.json();

          // Sign in to Firebase with custom token
          await signInWithCustomToken(auth, token);
          setIsFirebaseReady(true);

          // Sync user's photo URL to Firestore if available
          if (session.user.email && session.user.image) {
            await syncUserPhotoURL(session.user.email, session.user.image);
          }
        } catch (error) {
          console.error('[useFirebaseAuth] Error signing in to Firebase:', error);
          setIsFirebaseReady(false);
        }
      } else {
        // User is signed out
        if (auth.currentUser) {
          await signOut(auth);
        }
        setIsFirebaseReady(false);
      }
    }

    syncAuth();
  }, [session, status]);

  return { session, status, isFirebaseReady };
}
