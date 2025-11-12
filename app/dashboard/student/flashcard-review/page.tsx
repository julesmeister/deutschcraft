'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { StatCardSimple } from '@/components/ui/StatCardSimple';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { DataCard, DataCardGrid } from '@/components/ui/DataCard';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useFlashcardReviews } from '@/lib/hooks/useFlashcards';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';

// Import level data
import a1Data from '@/lib/data/remnote/levels/a1.json';
import a2Data from '@/lib/data/remnote/levels/a2.json';
import b1Data from '@/lib/data/remnote/levels/b1.json';
import b2Data from '@/lib/data/remnote/levels/b2.json';
import c1Data from '@/lib/data/remnote/levels/c1.json';
import c2Data from '@/lib/data/remnote/levels/c2.json';

const levelData: Record<CEFRLevel, any> = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

type FilterType = 'due-today' | 'struggling' | 'all-reviewed';

export default function FlashcardReviewPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [filterType, setFilterType] = useState<FilterType>('due-today');
  const [isPracticing, setIsPracticing] = useState(false);

  // Fetch all flashcard reviews for current user
  const { data: reviews = [], isLoading } = useFlashcardReviews(session?.user?.email ?? undefined);

  // Get all flashcards from the selected level
  const allFlashcards = useMemo(() => {
    const data = levelData[selectedLevel];
    return (data.flashcards || []).map((card: any) => ({
      id: card.id || card.german,
      german: card.german,
      english: card.english,
      category: card.category,
      level: selectedLevel,
      examples: card.examples || [],
      wordId: card.id || card.german,
    }));
  }, [selectedLevel]);

  // Filter flashcards based on review data
  const filteredFlashcards = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return allFlashcards.filter(card => {
      const review = reviews.find(r => r.flashcardId === card.id || r.wordId === card.wordId);

      if (!review) return false; // Only show reviewed cards

      switch (filterType) {
        case 'due-today':
          // Cards due for review today or overdue
          return review.nextReviewDate <= now;

        case 'struggling':
          // Cards with low mastery or marked as "again" recently
          return review.masteryLevel < 50 ||
                 (review.lastReviewDate > oneDayAgo && review.incorrectCount > review.correctCount);

        case 'all-reviewed':
          // All cards that have been reviewed at least once
          return true;

        default:
          return false;
      }
    });
  }, [allFlashcards, reviews, filterType]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = Date.now();
    const reviewedCards = reviews.filter(r => {
      return allFlashcards.some(card => card.id === r.flashcardId || card.wordId === r.wordId);
    });

    const dueToday = reviewedCards.filter(r => r.nextReviewDate <= now).length;
    const struggling = reviewedCards.filter(r => r.masteryLevel < 50).length;
    const total = reviewedCards.length;

    return { dueToday, struggling, total };
  }, [reviews, allFlashcards]);

  if (!session) {
    return <CatLoader message="Loading..." size="lg" fullScreen />;
  }

  if (isLoading) {
    return <CatLoader message="Loading your review cards..." size="lg" fullScreen />;
  }

  // Practice mode
  if (isPracticing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Flashcard Review"
          subtitle={`${CEFRLevelInfo[selectedLevel].displayName} • ${filterType === 'due-today' ? 'Due Today' : filterType === 'struggling' ? 'Struggling Cards' : 'All Reviewed'}`}
          backButton={{
            label: 'Back to Review Dashboard',
            onClick: () => setIsPracticing(false)
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <FlashcardPractice
            flashcards={filteredFlashcards}
            categoryName={filterType === 'due-today' ? 'Due Today' : filterType === 'struggling' ? 'Struggling Cards' : 'All Reviewed Cards'}
            level={selectedLevel}
            onBack={() => setIsPracticing(false)}
            showExamples={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Flashcard Review 🔄"
        subtitle="Review cards you've practiced before"
        backButton={{
          label: 'Back to Flashcards',
          onClick: () => router.push('/dashboard/student/flashcards')
        }}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Level Selector */}
        <div className="mb-8">
          <CEFRLevelSelector
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            colorScheme="default"
            showDescription={true}
            size="sm"
          />
        </div>

        {/* Stats Cards - Clickable Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCardSimple
            label="Due Today"
            value={stats.dueToday}
            icon="📅"
            bgColor="bg-blue-100"
            iconBgColor="bg-blue-500"
            onClick={() => setFilterType('due-today')}
            isActive={filterType === 'due-today'}
          />
          <StatCardSimple
            label="Struggling"
            value={stats.struggling}
            icon="💪"
            bgColor="bg-orange-100"
            iconBgColor="bg-orange-500"
            onClick={() => setFilterType('struggling')}
            isActive={filterType === 'struggling'}
          />
          <StatCardSimple
            label="Total Reviewed"
            value={stats.total}
            icon="✅"
            bgColor="bg-emerald-100"
            iconBgColor="bg-emerald-500"
            onClick={() => setFilterType('all-reviewed')}
            isActive={filterType === 'all-reviewed'}
          />
        </div>

        {/* Cards Section */}
        {filteredFlashcards.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="text-6xl mb-4">
              {filterType === 'due-today' ? '🎉' : filterType === 'struggling' ? '💪' : '📚'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterType === 'due-today'
                ? 'All caught up!'
                : filterType === 'struggling'
                ? 'No struggling cards'
                : 'No reviewed cards yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterType === 'due-today'
                ? 'You have no cards due for review today. Great job!'
                : filterType === 'struggling'
                ? 'All your cards are doing well! Keep up the good work.'
                : 'Start practicing flashcards to build your review collection.'}
            </p>
            <ActionButton
              onClick={() => router.push('/dashboard/student/flashcards')}
              variant="purple"
              icon={<ActionButtonIcons.ArrowRight />}
            >
              Go to Flashcards
            </ActionButton>
          </div>
        ) : (
          <>
            {/* Review CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {filteredFlashcards.length} Card{filteredFlashcards.length !== 1 ? 's' : ''} Ready for Review
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {filterType === 'due-today' && 'These cards are due for review based on spaced repetition'}
                    {filterType === 'struggling' && 'Focus on these cards to improve your mastery level'}
                    {filterType === 'all-reviewed' && 'All cards you\'ve practiced before are available'}
                  </p>
                </div>
                <div className="md:w-64">
                  <ActionButton
                    onClick={() => setIsPracticing(true)}
                    variant="purple"
                    icon={<ActionButtonIcons.ArrowRight />}
                  >
                    Start Review Session
                  </ActionButton>
                </div>
              </div>
            </div>

            {/* Card Preview - Data Cards */}
            <DataCardGrid>
              {filteredFlashcards.slice(0, 6).map(card => {
                const review = reviews.find(r => r.flashcardId === card.id || r.wordId === card.wordId);
                return (
                  <DataCard
                    key={card.id}
                    value={card.german}
                    title={card.english}
                    description={card.category}
                    mastery={review?.masteryLevel}
                    onClick={() => setIsPracticing(true)}
                    accentColor={
                      review?.masteryLevel >= 70 ? '#10b981' :
                      review?.masteryLevel >= 40 ? '#f59e0b' :
                      '#6b7280'
                    }
                  />
                );
              })}
            </DataCardGrid>
            {filteredFlashcards.length > 6 && (
              <div className="text-center mt-4 text-sm text-gray-500">
                +{filteredFlashcards.length - 6} more cards available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
