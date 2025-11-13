/**
 * User Helper Utilities
 * Centralized functions to get consistent user data across the app
 *
 * This prevents the recurring issue of displaying emails instead of names
 */

import type { Session } from 'next-auth';
import type { Student } from '@/lib/models';

/**
 * Get user's display name with proper fallback priority
 *
 * Priority:
 * 1. Firestore user.name (most reliable)
 * 2. Session displayName (from OAuth)
 * 3. Email address (last resort)
 *
 * @example
 * const userName = getUserDisplayName(currentUser, session);
 * // Returns: "John Doe" instead of "john@example.com"
 */
export function getUserDisplayName(
  firestoreUser: Student | null | undefined,
  session: Session | null | undefined
): string {
  // Priority 1: Firestore name field (from Google OAuth)
  if ((firestoreUser as any)?.name) {
    return (firestoreUser as any).name;
  }

  // Priority 2: Firestore firstName + lastName
  if (firestoreUser?.firstName || firestoreUser?.lastName) {
    return `${firestoreUser.firstName || ''} ${firestoreUser.lastName || ''}`.trim();
  }

  // Priority 3: Session displayName
  if (session?.user?.displayName) {
    return session.user.displayName;
  }

  // Priority 4: Session name (Google OAuth)
  if ((session?.user as any)?.name) {
    return (session.user as any).name;
  }

  // Priority 5: Email (fallback)
  if (session?.user?.email) {
    return session.user.email;
  }

  // Last resort
  return 'User';
}

/**
 * Get user's role from Firestore data
 *
 * @example
 * const role = getUserRole(currentUser);
 * // Returns: 'teacher' | 'student'
 */
export function getUserRole(
  firestoreUser: Student | null | undefined
): 'teacher' | 'student' {
  const role = firestoreUser?.role?.toUpperCase() as 'STUDENT' | 'TEACHER' | undefined;
  return role === 'TEACHER' ? 'teacher' : 'student';
}

/**
 * Get complete user info for components
 *
 * @example
 * const { userId, userName, userEmail, userRole } = getUserInfo(currentUser, session);
 */
export function getUserInfo(
  firestoreUser: Student | null | undefined,
  session: Session | null | undefined
) {
  const userEmail = session?.user?.email || '';
  const userName = getUserDisplayName(firestoreUser, session);
  const userId = userEmail; // Email is the user ID in our system
  const userRole = getUserRole(firestoreUser);

  return {
    userId,
    userName,
    userEmail,
    userRole,
  };
}
