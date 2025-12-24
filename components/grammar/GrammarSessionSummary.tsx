'use client';

import { BaseSessionSummary, SessionStats } from '@/components/shared/BaseSessionSummary';

interface GrammarSessionSummaryProps {
  stats: SessionStats;
  totalSentences: number;
  timeSpent: number; // in seconds
  onReviewMistakes: () => void;
  onReviewAll: () => void;
  onFinish: () => void;
}

export function GrammarSessionSummary({
  stats,
  totalSentences,
  timeSpent,
  onReviewMistakes,
  onReviewAll,
  onFinish,
}: GrammarSessionSummaryProps) {
  return (
    <BaseSessionSummary
      stats={stats}
      totalItems={totalSentences}
      timeSpent={timeSpent}
      onReview={onReviewMistakes}
      onReviewAll={onReviewAll}
      onFinish={onFinish}
      title="Practice Complete!"
      itemLabel="Sentences Practiced"
      reviewButtonText="Retry Mistakes"
      reviewAllButtonText="Review All"
      finishButtonText="Back to Rules"
      showConfetti={true}
      hideReviewIfNoMistakes={true}
    />
  );
}
