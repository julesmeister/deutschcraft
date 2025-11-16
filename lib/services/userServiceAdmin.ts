/**
 * User Service - Server-side (Firebase Admin SDK)
 * For use in API routes and NextAuth callbacks
 */

import { adminDb } from '../firebaseAdmin';
import { User } from '../models';

/**
 * Get a single user by email (server-side)
 * @param email - User's email (document ID)
 * @returns User object or null if not found
 */
export async function getUserAdmin(email: string): Promise<User | null> {
  try {
    const userDoc = await adminDb.collection('users').doc(email).get();

    if (!userDoc.exists) {
      return null;
    }

    return {
      userId: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error) {
    throw error;
  }
}

/**
 * Create or update a user (upsert) - server-side
 * @param user - User object with email required
 */
export async function upsertUserAdmin(user: Partial<User> & { email: string }): Promise<void> {
  try {
    await adminDb.collection('users').doc(user.email).set({
      userId: user.email,
      ...user,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user details (server-side)
 * @param email - User's email (document ID)
 * @param updates - Partial user object with fields to update
 */
export async function updateUserAdmin(email: string, updates: Partial<User>): Promise<void> {
  try {
    await adminDb.collection('users').doc(email).update({
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    throw error;
  }
}
