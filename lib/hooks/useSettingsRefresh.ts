/**
 * useSettingsRefresh Hook
 * DATABASE-AGNOSTIC hook for refreshing user data and session
 *
 * This hook orchestrates the refresh flow but does NOT directly interact with
 * any specific database. It delegates to:
 * - settingsService for cache management (database-agnostic)
 * - React Query for data fetching (calls configured data source)
 * - NextAuth for session management (reads from configured database)
 *
 * Works with Firestore, Turso, or any other data source configured in
 * lib/hooks/useUserQueries.ts and lib/auth.ts
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/toast';
import { refreshUserData, refreshSession, reloadPage } from '@/lib/services/settingsService';

export function useSettingsRefresh() {
  const queryClient = useQueryClient();
  const { update: updateSession } = useSession();
  const toast = useToast();

  /**
   * Refresh user data and session token
   *
   * Flow:
   * 1. Invalidate React Query cache
   * 2. React Query refetches from configured data source (Firestore/Turso/etc)
   * 3. Update NextAuth session (triggers JWT refresh from configured database)
   * 4. Reload page to ensure new JWT is applied in middleware
   *
   * @param email - User's email address to refresh
   */
  const handleRefresh = async (email: string | null | undefined) => {
    if (!email) {
      console.warn('[useSettingsRefresh] No email provided');
      return;
    }

    try {
      // Step 1 & 2: Invalidate cache and trigger refetch from data source
      await refreshUserData(email, queryClient);

      // Step 3: Refresh NextAuth session and JWT token
      await refreshSession(updateSession);

      // Step 4: Show success message
      toast.success('Data refreshed! Reloading page...');

      // Step 5: Reload page to apply new JWT token in middleware
      reloadPage(1000);
    } catch (error) {
      console.error('[useSettingsRefresh] Error refreshing:', error);
      toast.error('Failed to refresh data. Please try again.');
    }
  };

  return {
    handleRefresh,
  };
}
