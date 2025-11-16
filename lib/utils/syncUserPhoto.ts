import { syncUserPhotoURL as syncUserPhotoService } from '@/lib/services/userPhotoService';

/**
 * Syncs user's photo URL from session to Firestore if missing or different
 * Wrapper around userPhotoService for backward compatibility
 */
export async function syncUserPhotoURL(email: string, photoURL: string | null | undefined) {
  try {
    if (!email || !photoURL) return;
    await syncUserPhotoService(email, photoURL);
  } catch (error) {
    // Silent fail - expected for new users without Firestore documents
  }
}
