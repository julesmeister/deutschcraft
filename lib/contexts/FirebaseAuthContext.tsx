'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { syncUserPhotoURL } from '../utils/syncUserPhoto';
import { useToast } from '@/lib/hooks/useToast';
import { Session } from 'next-auth';

interface FirebaseAuthContextValue {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isFirebaseReady: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
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
          console.error('[FirebaseAuthProvider] Error signing in to Firebase:', error);
          setIsFirebaseReady(false);

          // Show toast for network errors (only once per session)
          if (!hasShownError) {
            const isNetworkError = error?.code === 'auth/network-request-failed';

            showToast(
              isNetworkError
                ? 'Unable to connect to Firebase. Please check your internet connection.'
                : 'Failed to authenticate with Firebase. Some features may not work.',
              'error',
              6000,
              isNetworkError ? 'Connection Error' : 'Authentication Error'
            );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  return (
    <FirebaseAuthContext.Provider value={{ session, status, isFirebaseReady }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}
