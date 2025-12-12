/**
 * Settings Service
 * DATABASE-AGNOSTIC service for managing user data refresh operations
 *
 * This service does NOT directly interact with any database (Firestore, Turso, etc).
 * It only manages React Query cache invalidation and session refresh.
 *
 * The actual database queries are handled by:
 * - lib/services/userService.ts (Firestore implementation)
 * - lib/services/turso/userService.ts (Turso implementation)
 *
 * React Query automatically calls the appropriate service based on the queryFn
 * configured in hooks like useCurrentUser, useTeacherStudents, etc.
 *
 * To switch databases, update the imports in lib/hooks/useUserQueries.ts
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Refresh user data by invalidating React Query cache
 *
 * This triggers React Query to refetch data from whatever data source
 * is configured in the hooks (Firestore, Turso, REST API, etc.)
 *
 * Flow:
 * 1. Invalidate cache with queryKey ['user', email]
 * 2. React Query automatically calls the queryFn from the hook
 * 3. The queryFn calls getUser() from userService (Firestore or Turso)
 * 4. Fresh data is fetched and cached
 *
 * @param email - User's email address
 * @param queryClient - React Query client instance
 */
export async function refreshUserData(
  email: string,
  queryClient: QueryClient
): Promise<void> {
  console.log('[SettingsService] Starting cache refresh for:', email);

  // Invalidate and refetch React Query cache
  // This will trigger the queryFn configured in useCurrentUser hook
  await queryClient.invalidateQueries({ queryKey: ['user', email] });
  await queryClient.refetchQueries({ queryKey: ['user', email] });

  console.log('[SettingsService] Cache refreshed - data fetched from configured data source');
}

/**
 * Trigger session refresh to update JWT token
 *
 * This updates the NextAuth session, which triggers a JWT refresh.
 * The JWT contains user data that was stored during sign-in.
 *
 * Note: JWT data comes from the database configured in NextAuth callbacks,
 * which is currently Firestore. If migrating to Turso, update the NextAuth
 * configuration in lib/auth.ts to read from Turso instead.
 *
 * @param updateSession - NextAuth update function
 */
export async function refreshSession(
  updateSession: () => Promise<any>
): Promise<void> {
  console.log('[SettingsService] Refreshing session...');

  // Update session (triggers JWT refresh)
  await updateSession();

  console.log('[SettingsService] Session updated');
}

/**
 * Reload the page after a delay
 *
 * Used after refreshing data to ensure the new JWT token
 * is applied in middleware and all client-side state is reset.
 *
 * @param delayMs - Delay in milliseconds before reloading (default: 1000ms)
 */
export function reloadPage(delayMs: number = 1000): void {
  setTimeout(() => {
    window.location.reload();
  }, delayMs);
}
