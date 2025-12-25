'use client';

import { useSession } from 'next-auth/react';
import { User } from '@/lib/models';

export interface SessionComparisonResult {
  hasRoleMismatch: boolean;
  jwtRole: string | undefined;
  firestoreRole: string | undefined;
  isStale: boolean;
}

/**
 * Compare JWT token role with Firestore role to detect stale sessions
 *
 * A session is considered "stale" when:
 * - JWT token role differs from Firestore role
 * - JWT shows PENDING_APPROVAL but Firestore shows STUDENT (approved case)
 *
 * @param currentUser - Firestore user document
 * @param isLoading - Whether user data is still loading
 * @returns Session comparison result with staleness flag
 */
export function useSessionComparison(
  currentUser: User | null | undefined,
  isLoading: boolean
): SessionComparisonResult {
  const { data: session } = useSession();

  // Don't compare while loading or if no user document
  if (isLoading || !currentUser) {
    return {
      hasRoleMismatch: false,
      jwtRole: undefined,
      firestoreRole: undefined,
      isStale: false,
    };
  }

  // Extract roles (normalize to uppercase for comparison)
  const jwtRole = (session?.user as any)?.role?.toUpperCase();
  const firestoreRole = currentUser.role?.toUpperCase();

  // Check for mismatch
  const hasRoleMismatch = jwtRole !== firestoreRole;

  // Session is stale if:
  // 1. Roles don't match, OR
  // 2. JWT has PENDING_APPROVAL but Firestore has STUDENT (student was approved)
  const isStale =
    hasRoleMismatch ||
    (jwtRole === 'PENDING_APPROVAL' && firestoreRole === 'STUDENT');

  return {
    hasRoleMismatch,
    jwtRole,
    firestoreRole,
    isStale,
  };
}
