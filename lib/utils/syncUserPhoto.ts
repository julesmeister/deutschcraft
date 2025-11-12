import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Syncs user's photo URL from session to Firestore if missing or different
 */
export async function syncUserPhotoURL(email: string, photoURL: string | null | undefined) {
  try {
    if (!email || !photoURL) return;

    const userDocRef = doc(db, 'users', email);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();

      // Only update if photoURL is missing or different
      if (!userData.photoURL || userData.photoURL !== photoURL) {
        await setDoc(userDocRef, {
          photoURL: photoURL,
          updatedAt: Date.now(),
        }, { merge: true });
      }
    }
  } catch (error) {
    console.error('[SyncPhoto] Error syncing photoURL:', error);
  }
}
