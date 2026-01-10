'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useCurrentStudent } from './useUsers';
import { useSessionComparison } from './useSessionComparison';
import { isPendingApproval } from '../models/user';

export type SettingsTab = 'enrollment' | 'profile' | 'security' | 'notification' | 'flashcards' | 'integration' | 'migration' | 'display';

export interface RedirectInfo {
  wasRedirected: boolean;
  reason: 'pending' | 'role_mismatch' | null;
  intendedPath: string | null;
}

/**
 * Hook to manage settings page data and state
 */
export function useSettingsData() {
  const searchParams = useSearchParams();
  const { session, status, isFirebaseReady } = useFirebaseAuth();
  const { student: currentUser, isLoading } = useCurrentStudent(session?.user?.email || null, isFirebaseReady);

  // Session comparison to detect staleness
  const sessionComparison = useSessionComparison(currentUser, isLoading);

  // Parse redirect info from URL parameters
  const redirectReason = searchParams.get('redirect_reason') as 'pending' | 'role_mismatch' | null;
  const intendedPath = searchParams.get('intended_path');

  const redirectInfo: RedirectInfo = {
    wasRedirected: !!redirectReason,
    reason: redirectReason,
    intendedPath,
  };

  // Check if user is pending approval OR if they don't have a document yet (new user)
  const isPending = !currentUser || (currentUser && isPendingApproval(currentUser));

  const [activeTab, setActiveTab] = useState<SettingsTab>(isPending ? 'enrollment' : 'profile');
  const [saveMessage, setSaveMessage] = useState('');

  return {
    session,
    status,
    currentUser,
    isLoading,
    isPending,
    activeTab,
    setActiveTab,
    saveMessage,
    setSaveMessage,
    redirectInfo,
    sessionComparison,
  };
}
