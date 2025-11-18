'use client';

import { useRouter } from 'next/navigation';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

type FilterType = 'due-today' | 'struggling' | 'new' | 'learning' | 'review' | 'lapsed' | 'all-reviewed';

interface ReviewEmptyStateProps {
  filterType: FilterType;
}

export function ReviewEmptyState({ filterType }: ReviewEmptyStateProps) {
  const router = useRouter();

  const emptyStateConfig = {
    'due-today': {
      emoji: '🎉',
      title: 'All caught up!',
      description: 'You have no cards due for review today. Great job!',
    },
    'struggling': {
      emoji: '💪',
      title: 'No struggling cards',
      description: 'All your cards are doing well! Keep up the good work.',
    },
    'new': {
      emoji: '🆕',
      title: 'No new cards',
      description: 'All cards have been started. Begin practicing to see new cards.',
    },
    'learning': {
      emoji: '📖',
      title: 'No cards in learning',
      description: 'No cards are currently in the learning phase.',
    },
    'review': {
      emoji: '🔄',
      title: 'No cards in review',
      description: 'No cards have reached review stage yet. Keep practicing!',
    },
    'lapsed': {
      emoji: '⚠️',
      title: 'No lapsed cards',
      description: 'Great! No cards have been forgotten recently.',
    },
    'all-reviewed': {
      emoji: '📚',
      title: 'No reviewed cards yet',
      description: 'Start practicing flashcards to build your review collection.',
    },
  };

  const config = emptyStateConfig[filterType];

  return (
    <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
      <div className="text-6xl mb-4">{config.emoji}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
      <p className="text-gray-600 mb-6">{config.description}</p>
      <div className="flex justify-center">
        <div className="w-fit">
          <ActionButton
            onClick={() => router.push('/dashboard/student/flashcards')}
            variant="purple"
            icon={<ActionButtonIcons.ArrowRight />}
          >
            Go to Flashcards
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
