'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { syncUserPhotoURL } from '../utils/syncUserPhoto';
import { useToast } from '@/components/ui/toast';

/**
 * Syncs NextAuth session with Firebase Auth
 * When user is signed in with NextAuth (Google), also sign them into Firebase
 * This allows Firestore security rules to work with request.auth
 */
export function useFirebaseAuth() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

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
          setHasShownError(false); // Reset error flag on success

          // Sync user's photo URL to Firestore if available
          // Silent fail - new users may not have Firestore documents yet
          if (session.user.email && session.user.image) {
            try {
              await syncUserPhotoURL(session.user.email, session.user.image);
            } catch (error) {
              // Silent fail - photo sync is not critical
            }
          }
        } catch (error: any) {
          console.error('[useFirebaseAuth] Error signing in to Firebase:', error);
          setIsFirebaseReady(false);

          // Show toast for network errors (only once per session)
          if (!hasShownError) {
            const isNetworkError = error?.code === 'auth/network-request-failed';

            showToast({
              title: isNetworkError ? 'Connection Error' : 'Authentication Error',
              message: isNetworkError
                ? 'Unable to connect to Firebase. Please check your internet connection.'
                : 'Failed to authenticate with Firebase. Some features may not work.',
              variant: 'error',
              duration: 6000,
            });
            setHasShownError(true);
          }
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
