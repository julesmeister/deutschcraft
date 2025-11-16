'use client';

import { useState } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useCurrentStudent } from './useUsers';
import { isPendingApproval } from '../models/user';

export type SettingsTab = 'enrollment' | 'profile' | 'security' | 'notification' | 'flashcards' | 'integration';

/**
 * Hook to manage settings page data and state
 */
export function useSettingsData() {
  const { session, status, isFirebaseReady } = useFirebaseAuth();
  const { student: currentUser, isLoading } = useCurrentStudent(session?.user?.email || null, isFirebaseReady);

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
  };
}
