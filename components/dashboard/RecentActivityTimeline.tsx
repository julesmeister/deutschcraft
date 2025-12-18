/**
 * RecentActivityTimeline Component
 * Displays recent flashcard sessions or writing submissions in a timeline
 * Refactored into separate tab components for better maintainability
 */

import { useState, useEffect } from 'react';
import { WritingSubmission } from '@/lib/models/writing';
import { FlashcardActivityTab } from './FlashcardActivityTab';
import { GrammatikActivityTab } from './GrammatikActivityTab';
import { WritingActivityTab } from './WritingActivityTab';

interface RecentSession {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timeSpent: number;
}

interface RecentActivityTimelineProps {
  activeTab: 'flashcards' | 'writing' | 'grammatik';
  recentSessions: RecentSession[];
  writingSubmissions: WritingSubmission[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  itemsPerPage?: number;
}

export function RecentActivityTimeline({
  activeTab,
  recentSessions,
  writingSubmissions,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  isLoading = false,
  hasMore = true,
  itemsPerPage = 8,
}: RecentActivityTimelineProps) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  // Use external pagination if provided, otherwise use internal
  const currentPage = externalCurrentPage || internalCurrentPage;
  const onPageChange = externalOnPageChange || setInternalCurrentPage;

  // Reset to page 1 when switching tabs
  useEffect(() => {
    onPageChange(1);
  }, [activeTab]);

  if (activeTab === 'flashcards') {
    return (
      <FlashcardActivityTab
        recentSessions={recentSessions}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isLoading={isLoading}
        hasMore={hasMore}
      />
    );
  }

  if (activeTab === 'grammatik') {
    const grammarSessions = writingSubmissions.filter((item: any) => item.isGrammarSession);

    return (
      <GrammatikActivityTab
        grammarSessions={grammarSessions as any}
        currentPage={currentPage}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
      />
    );
  }

  // Writing tab
  return (
    <WritingActivityTab
      writingSubmissions={writingSubmissions}
      currentPage={currentPage}
      onPageChange={onPageChange}
      itemsPerPage={itemsPerPage}
    />
  );
}
