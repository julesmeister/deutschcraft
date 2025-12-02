'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { StatCardSimple } from '@/components/ui/StatCardSimple';
import { FileCard, FileGrid, FileSection } from '@/components/ui/FileCard';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ToastProvider } from '@/components/ui/toast';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudyStats, useFlashcardReviews } from '@/lib/hooks/useFlashcards';
import { useRemNoteCategories, useRemNoteTotalCards } from '@/lib/hooks/useRemNoteCategories';
import { useFlashcardSettings } from '@/lib/hooks/useFlashcardSettings';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { CatLoader } from '@/components/ui/CatLoader';

// Import level data
import a1Data from '@/lib/data/vocabulary/levels/a1.json';
import a2Data from '@/lib/data/vocabulary/levels/a2.json';
import b1Data from '@/lib/data/vocabulary/levels/b1.json';
import b2Data from '@/lib/data/vocabulary/levels/b2.json';
import c1Data from '@/lib/data/vocabulary/levels/c1.json';
import c2Data from '@/lib/data/vocabulary/levels/c2.json';

const levelDataMap = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

export default function FlashcardsLandingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [practiceFlashcards, setPracticeFlashcards] = useState<any[]>([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [nextDueInfo, setNextDueInfo] = useState<{ count: number; nextDueDate: number } | undefined>();
  const [upcomingCards, setUpcomingCards] = useState<any[]>([]);

  // Fetch real data from Firestore (with refresh key to force re-fetch after session)
  const { stats, isLoading: statsLoading } = useStudyStats(session?.user?.email || undefined, statsRefreshKey);

  // Get RemNote categories for selected level
  const { categories, isLoading: categoriesLoading } = useRemNoteCategories(selectedLevel);
  const totalRemNoteCards = useRemNoteTotalCards(selectedLevel);

  // Get flashcard settings
  const { settings } = useFlashcardSettings();

  // Fetch user's flashcard progress to identify attempted categories
  const { data: flashcardReviews = [], refetch: refetchReviews } = useFlashcardReviews(session?.user?.email);

  // Create a Set of attempted category IDs and count attempts per category
  const attemptedCategories = new Set<string>();
  const categoryAttemptCounts = new Map<string, number>();
  const categoryTotalCounts = new Map<string, number>();

  // Count total cards per category
  const levelData = levelDataMap[selectedLevel];
  levelData.flashcards.forEach((card: any) => {
    const categoryId = card.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    categoryTotalCounts.set(categoryId, (categoryTotalCounts.get(categoryId) || 0) + 1);
  });

  // Count attempted cards per category
  flashcardReviews.forEach(review => {
    const flashcard = levelData.flashcards.find((card: any) => card.id === review.wordId || card.id === review.flashcardId);
    if (flashcard) {
      const categoryId = flashcard.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      attemptedCategories.add(categoryId);
      categoryAttemptCounts.set(categoryId, (categoryAttemptCounts.get(categoryId) || 0) + 1);
    }
  });

  // Determine completion status for each category
  const categoryCompletionStatus = new Map<string, 'completed' | 'in-progress' | 'not-started'>();
  attemptedCategories.forEach(categoryId => {
    const attempted = categoryAttemptCounts.get(categoryId) || 0;
    const total = categoryTotalCounts.get(categoryId) || 0;

    if (attempted >= total) {
      categoryCompletionStatus.set(categoryId, 'completed');
    } else if (attempted > 0) {
      categoryCompletionStatus.set(categoryId, 'in-progress');
    }
  });

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Get flashcards for this category and level
    const levelData = levelDataMap[selectedLevel];
    let categoryFlashcards = levelData.flashcards.filter(
      (card: any) => card.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === categoryId
    ).map((card: any) => {
      // Find progress for this card
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
      return {
        ...card,
        wordId: card.id, // Use flashcard id as wordId for now
        masteryLevel: progress?.masteryLevel ?? 0, // Add mastery level from progress
        nextReviewDate: progress?.nextReviewDate,
      };
    });

    // Apply settings (potentially heavy operation)
    const { cards, nextDueInfo, upcomingCards } = applyFlashcardSettings(categoryFlashcards);

    // Use transition to keep UI responsive during state updates
    startTransition(() => {
      setPracticeFlashcards(cards);
      setSelectedCategory(categoryName);
      setNextDueInfo(nextDueInfo);
      setUpcomingCards(upcomingCards);
    });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setPracticeFlashcards([]);
    // Invalidate queries to force fresh data after completing session
    queryClient.invalidateQueries({ queryKey: ['flashcard-reviews', session?.user?.email] });
    setStatsRefreshKey(prev => prev + 1);
  };

  const handleStartPractice = () => {
    // Get all flashcards for the selected level
    const levelData = levelDataMap[selectedLevel];
    let flashcardsWithWordId = levelData.flashcards.map((card: any) => {
      // Find progress for this card
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
      return {
        ...card,
        wordId: card.id, // Use flashcard id as wordId for now
        masteryLevel: progress?.masteryLevel ?? 0, // Add mastery level from progress
        nextReviewDate: progress?.nextReviewDate,
      };
    });

    // Apply settings (potentially heavy operation)
    const { cards, nextDueInfo, upcomingCards } = applyFlashcardSettings(flashcardsWithWordId);

    // Use transition to keep UI responsive during state updates
    startTransition(() => {
      setPracticeFlashcards(cards);
      setSelectedCategory('All Categories');
      setNextDueInfo(nextDueInfo);
      setUpcomingCards(upcomingCards);
    });
  };

  // Apply flashcard settings to flashcard array with STRICT SRS enforcement
  const applyFlashcardSettings = (flashcards: any[]): {
    cards: any[];
    nextDueInfo?: { count: number; nextDueDate: number };
    upcomingCards: any[];
  } => {
    const now = Date.now();

    // 1. STRICTLY FILTER TO ONLY DUE CARDS
    // Only include: new cards (never seen) OR cards with nextReviewDate <= now
    const dueCards = flashcards.filter(card => {
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);

      // New cards (never seen) are always included
      if (!progress) {
        console.log('[FlashcardSelection] ✅ Including NEW card:', {
          id: card.id,
          german: card.german,
          reason: 'Never seen before',
        });
        return true;
      }

      // Only include cards that are actually due for review RIGHT NOW
      const isDue = (progress.nextReviewDate || 0) <= now;

      if (isDue) {
        console.log('[FlashcardSelection] ✅ Including DUE card:', {
          id: card.id,
          german: card.german,
          nextReviewDate: new Date(progress.nextReviewDate || 0).toISOString(),
          wasOverdueBy: (now - (progress.nextReviewDate || 0)) / (1000 * 60 * 60) + ' hours',
        });
      } else {
        console.log('[FlashcardSelection] ❌ Skipping card NOT due yet:', {
          id: card.id,
          german: card.german,
          nextReviewDate: new Date(progress.nextReviewDate || 0).toISOString(),
          hoursUntilDue: ((progress.nextReviewDate || 0) - now) / (1000 * 60 * 60),
        });
      }

      return isDue;
    });

    // Calculate next due info for cards not yet due
    const notDueCards = flashcards.filter(card => {
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
      return progress && (progress.nextReviewDate || 0) > now;
    }).sort((a, b) => {
      const progressA = flashcardReviews.find(r => r.flashcardId === a.id || r.wordId === a.id);
      const progressB = flashcardReviews.find(r => r.flashcardId === b.id || r.wordId === b.id);
      return (progressA?.nextReviewDate || 0) - (progressB?.nextReviewDate || 0);
    }).map(card => {
      // Add the nextReviewDate to each card for display
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
      return {
        ...card,
        nextReviewDate: progress?.nextReviewDate || Date.now(),
      };
    });

    const nextDueInfo = notDueCards.length > 0
      ? {
          count: notDueCards.length,
          nextDueDate: flashcardReviews.find(r => r.flashcardId === notDueCards[0].id || r.wordId === notDueCards[0].id)?.nextReviewDate || Date.now(),
        }
      : undefined;

    // 2. PRIORITY SORTING within due cards
    let processedCards = dueCards.sort((a, b) => {
      const progressA = flashcardReviews.find(r => r.flashcardId === a.id || r.wordId === a.id);
      const progressB = flashcardReviews.find(r => r.flashcardId === b.id || r.wordId === b.id);

      // New cards first
      if (!progressA && progressB) return -1;
      if (progressA && !progressB) return 1;
      if (!progressA && !progressB) return 0;

      // Among due cards, prioritize by next review date (earlier = higher priority)
      return (progressA.nextReviewDate || 0) - (progressB.nextReviewDate || 0);
    });

    // 3. APPLY RANDOMIZATION (only among due cards)
    if (settings.randomizeOrder) {
      // Separate new cards from due review cards
      const newCards = processedCards.filter(card => {
        const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
        return !progress;
      });
      const dueReviewCards = processedCards.filter(card => {
        const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
        return progress;
      });

      // Randomize each group separately
      processedCards = [
        ...newCards.sort(() => Math.random() - 0.5),
        ...dueReviewCards.sort(() => Math.random() - 0.5),
      ];
    }

    // 4. APPLY SESSION LIMIT
    const cardsPerSession = settings.cardsPerSession !== -1 && settings.cardsPerSession > 0
      ? settings.cardsPerSession
      : 20; // Default to 20 if unlimited

    const finalCards = processedCards.slice(0, cardsPerSession);

    console.log('[FlashcardSelection] STRICT SRS Selection:', {
      totalAvailable: flashcards.length,
      dueForReview: dueCards.length,
      newCards: dueCards.filter(c => !flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
      reviewCards: dueCards.filter(c => flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
      selectedForSession: finalCards.length,
      notDueCards: flashcards.length - dueCards.length,
      nextDueInfo,
    });

    // If no due cards, show detailed breakdown
    if (finalCards.length === 0 && flashcards.length > 0) {
      console.log('[FlashcardSelection] ✅ No cards due for review! Breakdown:', {
        totalCards: flashcards.length,
        cardsWithProgress: flashcards.filter(c => flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
        newCards: flashcards.filter(c => !flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
        futureReviews: notDueCards.length,
        sampleFutureCard: notDueCards[0] ? {
          german: notDueCards[0].german,
          nextReview: new Date(flashcardReviews.find(r => r.flashcardId === notDueCards[0].id || r.wordId === notDueCards[0].id)?.nextReviewDate || 0).toISOString(),
        } : null,
      });
    }

    return {
      cards: finalCards,
      nextDueInfo,
      upcomingCards: notDueCards.slice(0, 15), // Return up to 15 upcoming cards for display
    };
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Flashcards 📚"
          subtitle="Master German vocabulary with spaced repetition"
          backButton={
            selectedCategory
              ? {
                label: 'Back to Categories',
                onClick: handleBackToCategories
              }
              : {
                label: 'Back to Dashboard',
                onClick: () => router.push('/dashboard/student')
              }
          }
          actions={
            !selectedCategory && (
              <ActionButton
                onClick={handleStartPractice}
                variant="purple"
                icon={<ActionButtonIcons.ArrowRight />}
                disabled={isPending}
              >
                {isPending ? 'Loading...' : 'Start Practice'}
              </ActionButton>
            )
          }
        />

        {/* Loading indicator for transitions */}
        {isPending && (
          <div className="fixed top-20 right-6 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              <span className="font-medium">Loading flashcards...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Show Flashcard Practice if category is selected */}
          {selectedCategory ? (
            <FlashcardPractice
              flashcards={practiceFlashcards}
              categoryName={selectedCategory}
              level={selectedLevel}
              onBack={handleBackToCategories}
              showExamples={settings.showExamples}
              nextDueInfo={nextDueInfo}
              upcomingCards={upcomingCards}
            />
          ) : (
            <>
              {/* Level Selector - Split Button Style */}
              <div className="mb-8">
                <CEFRLevelSelector
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                  colorScheme="default"
                  showDescription={true}
                  size="sm"
                />
              </div>

              {/* Loading State */}
              {statsLoading ? (
                <CatLoader message="Loading your stats..." size="md" />
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCardSimple
                      label="Available Cards"
                      value={totalRemNoteCards}
                      icon="📚"
                      bgColor="bg-blue-100"
                      iconBgColor="bg-blue-500"
                    />
                    <StatCardSimple
                      label="Cards Learned"
                      value={stats.cardsLearned}
                      icon="✅"
                      bgColor="bg-emerald-100"
                      iconBgColor="bg-emerald-500"
                    />
                    <StatCardSimple
                      label="Day Streak"
                      value={stats.streak}
                      icon="🔥"
                      bgColor="bg-amber-100"
                      iconBgColor="bg-amber-500"
                    />
                    <StatCardSimple
                      label="Accuracy"
                      value={`${stats.accuracy}%`}
                      icon="🎯"
                      bgColor="bg-purple-100"
                      iconBgColor="bg-purple-500"
                    />
                  </div>
                </>
              )}

              {/* Vocabulary Categories */}
              <FileSection title={`${selectedLevel} Vocabulary Categories`}>
                {categoriesLoading ? (
                  <CatLoader message="Loading categories..." size="md" />
                ) : categories.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No vocabulary yet</h3>
                    <p className="text-gray-600">
                      Vocabulary categories will appear here once you start learning
                    </p>
                  </div>
                ) : (
                  <FileGrid>
                    {categories.map((category) => {
                      const completionStatus = categoryCompletionStatus.get(category.id);
                      return (
                        <FileCard
                          key={category.id}
                          icon={
                            <div className="text-4xl">{category.icon}</div>
                          }
                          name={category.name}
                          size={`${category.cardCount} cards`}
                          onClick={() => handleCategoryClick(category.id, category.name)}
                          completionStatus={completionStatus}
                          attemptCount={categoryAttemptCounts.get(category.id)}
                        />
                      );
                    })}
                  </FileGrid>
                )}
              </FileSection>

              {/* Quick Actions */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Ready to practice?</h3>
                    <p className="text-sm text-neutral-600">
                      Start a flashcard session with all vocabulary or choose a specific category
                    </p>
                  </div>
                  <div className="md:w-64">
                    <ActionButton
                      onClick={handleStartPractice}
                      variant="purple"
                      icon={<ActionButtonIcons.ArrowRight />}
                    >
                      Start Practice Session
                    </ActionButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
