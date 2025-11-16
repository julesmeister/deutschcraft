/**
 * User Photo Service
 * Handles user photo URL operations in Firestore
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION = 'users';

/**
 * Get user's photo URL from Firestore
 */
export async function getUserPhotoURL(email: string): Promise<string | null> {
  try {
    const userDocRef = doc(db, COLLECTION, email);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.photoURL || null;
    }

    return null;
  } catch (error) {
    // Silent fail - expected for new users without Firestore documents
    return null;
  }
}

/**
 * Update user's photo URL in Firestore
 */
export async function updateUserPhotoURL(
  email: string,
  photoURL: string
): Promise<void> {
  try {
    const userDocRef = doc(db, COLLECTION, email);
    await setDoc(
      userDocRef,
      {
        photoURL,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    // Silent fail - photo update is not critical
    throw error;
  }
}

/**
 * Sync user's photo URL - only updates if missing or different
 */
export async function syncUserPhotoURL(
  email: string,
  photoURL: string
): Promise<void> {
  try {
    const currentPhotoURL = await getUserPhotoURL(email);

    // Only update if photoURL is missing or different
    if (!currentPhotoURL || currentPhotoURL !== photoURL) {
      await updateUserPhotoURL(email, photoURL);
    }
  } catch (error) {
    // Silent fail - expected for new users without Firestore documents
  }
}
