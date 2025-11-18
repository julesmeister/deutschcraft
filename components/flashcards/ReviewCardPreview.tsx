'use client';

import { useState } from 'react';
import { DataCard, DataCardGrid } from '@/components/ui/DataCard';
import { FlashcardProgress } from '@/lib/models';

interface FlashcardWithMastery {
  id: string;
  german: string;
  english: string;
  category: string;
  masteryLevel?: number;
  wordId?: string;
  nextReviewDate?: number;
}

interface ReviewCardPreviewProps {
  cards: FlashcardWithMastery[];
  reviews: FlashcardProgress[];
  onCardClick: () => void;
}

export function ReviewCardPreview({ cards, reviews, onCardClick }: ReviewCardPreviewProps) {
  const [showAllCards, setShowAllCards] = useState(false);
  const displayLimit = 12;
  const displayCards = showAllCards ? cards : cards.slice(0, displayLimit);

  // Helper function to format next review time
  const formatNextReview = (nextReviewDate: number | undefined) => {
    if (!nextReviewDate) return '';

    const now = Date.now();
    const diffMs = nextReviewDate - now;
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      if (overdueDays === 0) return 'Due today';
      if (overdueDays === 1) return 'Overdue 1 day';
      return `Overdue ${overdueDays} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays < 7) {
      return `Due in ${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Due in ${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Due in ${years} year${years > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <DataCardGrid>
        {displayCards.map((card, index) => {
          const review = reviews.find(r => r.flashcardId === card.id || r.wordId === card.wordId);
          const masteryLevel = review?.masteryLevel ?? 0;
          const nextReviewText = formatNextReview(card.nextReviewDate);

          return (
            <DataCard
              key={`${card.id}-${index}`}
              value={card.german}
              title={card.english}
              description={nextReviewText ? `${card.category} • ${nextReviewText}` : card.category}
              mastery={masteryLevel}
              onClick={onCardClick}
              accentColor={
                masteryLevel >= 70 ? '#10b981' :
                masteryLevel >= 40 ? '#f59e0b' :
                '#6b7280'
              }
            />
          );
        })}
      </DataCardGrid>

      {/* Show All / Show Less Toggle */}
      {cards.length > displayLimit && !showAllCards && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAllCards(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span>Show All {cards.length} Cards</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}

      {showAllCards && cards.length > displayLimit && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAllCards(false)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>Show Less</span>
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
