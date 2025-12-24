'use client';

import { BaseSessionSummary, SessionStats } from '@/components/shared/BaseSessionSummary';

interface SessionSummaryProps {
  stats: SessionStats;
  totalCards: number;
  timeSpent: number; // in seconds
  onReview: () => void;
  onFinish: () => void;
}

export function SessionSummary({
  stats,
  totalCards,
  timeSpent,
  onReview,
  onFinish,
}: SessionSummaryProps) {
  return (
    <BaseSessionSummary
      stats={stats}
      totalItems={totalCards}
      timeSpent={timeSpent}
      onReview={onReview}
      onFinish={onFinish}
      title="Session Complete!"
      itemLabel="Cards Reviewed"
      reviewButtonText="Review Forgotten Cards"
      finishButtonText="Finish Session"
      showConfetti={false}
      hideReviewIfNoMistakes={false}
    />
  );
}
