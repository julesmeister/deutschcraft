'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { saveAccount } from '@/lib/utils/accountHistory';

/**
 * AccountHistoryProvider
 *
 * Automatically saves user accounts to localStorage when they sign in.
 * This enables the account switcher dropdown to show previously used accounts.
 */
export function AccountHistoryProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only save if we have an authenticated session
    if (status === 'authenticated' && session?.user?.email) {
      const { email, name, image } = session.user;

      // Save account to history
      saveAccount(
        email,
        name || email, // Use email as fallback if name is not available
        image || undefined
      );

      console.info('✅ Account saved to history:', email);
    }
  }, [session, status]);

  return <>{children}</>;
}
