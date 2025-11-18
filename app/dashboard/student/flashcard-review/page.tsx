'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CatLoader } from '@/components/ui/CatLoader';
import { TabBar, type TabItem } from '@/components/ui/TabBar';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { DataCard, DataCardGrid } from '@/components/ui/DataCard';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useFlashcardReviews } from '@/lib/hooks/useFlashcards';
import { useFlashcardSettings } from '@/lib/hooks/useFlashcardSettings';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';

// Import level data
import a1Data from '@/lib/data/vocabulary/levels/a1.json';
import a2Data from '@/lib/data/vocabulary/levels/a2.json';
import b1Data from '@/lib/data/vocabulary/levels/b1.json';
import b2Data from '@/lib/data/vocabulary/levels/b2.json';
import c1Data from '@/lib/data/vocabulary/levels/c1.json';
import c2Data from '@/lib/data/vocabulary/levels/c2.json';

const levelData: Record<CEFRLevel, any> = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

type FilterType = 'due-today' | 'struggling' | 'new' | 'learning' | 'review' | 'lapsed' | 'all-reviewed';

interface FlashcardData {
  id?: string;
  german: string;
  english: string;
  category: string;
  examples?: string[];
}

export default function FlashcardReviewPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [filterType, setFilterType] = useState<FilterType>('due-today');
  const [isPracticing, setIsPracticing] = useState(false);

  // Fetch all flashcard reviews for current user
  const { data: reviews = [], isLoading, refetch } = useFlashcardReviews(session?.user?.email ?? undefined);

  // Get flashcard settings (for limiting cards per session)
  const { settings } = useFlashcardSettings();

  // Handle returning from practice mode
  const handleExitPractice = () => {
    setIsPracticing(false);
    // Refetch reviews to update the dashboard with latest progress
    refetch();
  };

  // Apply flashcard settings to limit cards per session
  const applySessionLimits = (flashcards: any[]) => {
    let processedCards = [...flashcards];

    // Apply randomize order if enabled
    if (settings.randomizeOrder) {
      processedCards = processedCards.sort(() => Math.random() - 0.5);
    }

    // Apply cards per session limit (-1 means unlimited)
    if (settings.cardsPerSession !== -1 && settings.cardsPerSession > 0) {
      processedCards = processedCards.slice(0, settings.cardsPerSession);
    }

    return processedCards;
  };

  // Get all flashcards from the selected level
  const allFlashcards = useMemo(() => {
    const data = levelData[selectedLevel];
    return (data.flashcards || []).map((card: FlashcardData) => ({
      id: card.id || card.german,
      german: card.german,
      english: card.english,
      category: card.category,
      level: selectedLevel,
      examples: card.examples || [],
      wordId: card.id || card.german,
    }));
  }, [selectedLevel]);

  // Filter flashcards based on review data and add mastery levels
  const filteredFlashcards = useMemo(() => {
    const now = Date.now();

    return allFlashcards
      .map(card => {
        const review = reviews.find(r => r.flashcardId === card.id || r.wordId === card.wordId);
        // Add masteryLevel from review data
        return {
          ...card,
          masteryLevel: review?.masteryLevel ?? 0,
        };
      })
      .filter(card => {
        const review = reviews.find(r => r.flashcardId === card.id || r.wordId === card.wordId);

        if (!review) return false; // Only show reviewed cards

      switch (filterType) {
        case 'due-today':
          // Cards due for review today or overdue
          return review.nextReviewDate <= now;

        case 'struggling':
          // Enhanced struggling detection
          return (
            review.masteryLevel < 40 ||
            review.consecutiveIncorrect >= 2 ||
            review.lapseCount >= 3 ||
            review.state === 'lapsed' ||
            review.state === 'relearning'
          );

        case 'new':
          return review.state === 'new';

        case 'learning':
          return review.state === 'learning';

        case 'review':
          return review.state === 'review';

        case 'lapsed':
          return review.state === 'lapsed' || review.state === 'relearning';

        case 'all-reviewed':
          // All cards that have been reviewed at least once
          return true;

        default:
          return false;
      }
    });
  }, [allFlashcards, reviews, filterType]);

  // Apply session limits to filtered flashcards for practice
  const cardsForPractice = useMemo(() => {
    return applySessionLimits(filteredFlashcards);
  }, [filteredFlashcards, settings.cardsPerSession, settings.randomizeOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = Date.now();
    const reviewedCards = reviews.filter(r => {
      return allFlashcards.some(card => card.id === r.flashcardId || card.wordId === r.wordId);
    });

    const dueToday = reviewedCards.filter(r => r.nextReviewDate <= now).length;
    const struggling = reviewedCards.filter(r =>
      r.masteryLevel < 40 ||
      r.consecutiveIncorrect >= 2 ||
      r.lapseCount >= 3 ||
      r.state === 'lapsed' ||
      r.state === 'relearning'
    ).length;
    const newCards = reviewedCards.filter(r => r.state === 'new').length;
    const learning = reviewedCards.filter(r => r.state === 'learning').length;
    const review = reviewedCards.filter(r => r.state === 'review').length;
    const lapsed = reviewedCards.filter(r => r.state === 'lapsed' || r.state === 'relearning').length;
    const total = reviewedCards.length;

    return { dueToday, struggling, newCards, learning, review, lapsed, total };
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
          subtitle={`${CEFRLevelInfo[selectedLevel].displayName} • ${
            filterType === 'due-today' ? 'Due Today' :
            filterType === 'struggling' ? 'Struggling Cards' :
            filterType === 'new' ? 'New Cards' :
            filterType === 'learning' ? 'Learning' :
            filterType === 'review' ? 'Review' :
            filterType === 'lapsed' ? 'Lapsed Cards' :
            'All Reviewed'
          }`}
          backButton={{
            label: 'Back to Review Dashboard',
            onClick: handleExitPractice
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <FlashcardPractice
            flashcards={cardsForPractice}
            categoryName={
              filterType === 'due-today' ? 'Due Today' :
              filterType === 'struggling' ? 'Struggling Cards' :
              filterType === 'new' ? 'New Cards' :
              filterType === 'learning' ? 'Learning' :
              filterType === 'review' ? 'Review' :
              filterType === 'lapsed' ? 'Lapsed Cards' :
              'All Reviewed Cards'
            }
            level={selectedLevel}
            onBack={handleExitPractice}
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

        {/* Stats Tabs - Compact Filters */}
        <div className="mb-8">
          <TabBar
            tabs={[
              { id: 'due-today', label: 'Due Today', icon: '📅', value: stats.dueToday },
              { id: 'struggling', label: 'Struggling', icon: '💪', value: stats.struggling },
              { id: 'new', label: 'New', icon: '🆕', value: stats.newCards },
              { id: 'learning', label: 'Learning', icon: '📖', value: stats.learning },
              { id: 'review', label: 'Review', icon: '🔄', value: stats.review },
              { id: 'lapsed', label: 'Lapsed', icon: '⚠️', value: stats.lapsed },
              { id: 'all-reviewed', label: 'All', icon: '✅', value: stats.total },
            ]}
            activeTabId={filterType}
            onTabChange={(tabId) => setFilterType(tabId as FilterType)}
            variant="tabs"
            size="compact"
          />
        </div>

        {/* Cards Section */}
        {filteredFlashcards.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="text-6xl mb-4">
              {filterType === 'due-today' ? '🎉' :
               filterType === 'struggling' ? '💪' :
               filterType === 'new' ? '🆕' :
               filterType === 'learning' ? '📖' :
               filterType === 'review' ? '🔄' :
               filterType === 'lapsed' ? '⚠️' : '📚'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterType === 'due-today' ? 'All caught up!' :
               filterType === 'struggling' ? 'No struggling cards' :
               filterType === 'new' ? 'No new cards' :
               filterType === 'learning' ? 'No cards in learning' :
               filterType === 'review' ? 'No cards in review' :
               filterType === 'lapsed' ? 'No lapsed cards' :
               'No reviewed cards yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterType === 'due-today' ? 'You have no cards due for review today. Great job!' :
               filterType === 'struggling' ? 'All your cards are doing well! Keep up the good work.' :
               filterType === 'new' ? 'All cards have been started. Begin practicing to see new cards.' :
               filterType === 'learning' ? 'No cards are currently in the learning phase.' :
               filterType === 'review' ? 'No cards have reached review stage yet. Keep practicing!' :
               filterType === 'lapsed' ? 'Great! No cards have been forgotten recently.' :
               'Start practicing flashcards to build your review collection.'}
            </p>
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
        ) : (
          <>
            {/* Review CTA */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    {cardsForPractice.length} Card{cardsForPractice.length !== 1 ? 's' : ''} Ready for Review
                    {filteredFlashcards.length > cardsForPractice.length && (
                      <span className="text-sm font-normal text-neutral-600 ml-2">
                        ({filteredFlashcards.length} total)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {filterType === 'due-today' && 'These cards are due for review based on spaced repetition'}
                    {filterType === 'struggling' && 'Focus on these cards to improve your mastery level'}
                    {filterType === 'new' && 'Brand new cards you haven\'t started yet'}
                    {filterType === 'learning' && 'Cards in the initial learning phase'}
                    {filterType === 'review' && 'Cards you\'ve mastered and are maintaining'}
                    {filterType === 'lapsed' && 'Cards that need relearning after being forgotten'}
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
              {cardsForPractice.slice(0, 6).map((card, index) => {
                const review = reviews.find(r => r.flashcardId === card.id || r.wordId === card.wordId);
                const masteryLevel = review?.masteryLevel ?? 0;
                return (
                  <DataCard
                    key={`${card.id}-${index}`}
                    value={card.german}
                    title={card.english}
                    description={card.category}
                    mastery={masteryLevel}
                    onClick={() => setIsPracticing(true)}
                    accentColor={
                      masteryLevel >= 70 ? '#10b981' :
                      masteryLevel >= 40 ? '#f59e0b' :
                      '#6b7280'
                    }
                  />
                );
              })}
            </DataCardGrid>
            {cardsForPractice.length > 6 && (
              <div className="text-center mt-4 text-sm text-gray-500">
                +{cardsForPractice.length - 6} more cards in this session
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
