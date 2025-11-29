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
      };
    });

    // Apply settings (potentially heavy operation)
    categoryFlashcards = applyFlashcardSettings(categoryFlashcards);

    // Use transition to keep UI responsive during state updates
    startTransition(() => {
      setPracticeFlashcards(categoryFlashcards);
      setSelectedCategory(categoryName);
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
      };
    });

    // Apply settings (potentially heavy operation)
    flashcardsWithWordId = applyFlashcardSettings(flashcardsWithWordId);

    // Use transition to keep UI responsive during state updates
    startTransition(() => {
      setPracticeFlashcards(flashcardsWithWordId);
      setSelectedCategory('All Categories');
    });
  };

  // Apply flashcard settings to flashcard array
  const applyFlashcardSettings = (flashcards: any[]) => {
    let processedCards = [...flashcards];

    // Apply randomize order
    if (settings.randomizeOrder) {
      processedCards = processedCards.sort(() => Math.random() - 0.5);
    }

    // Apply cards per session limit
    if (settings.cardsPerSession !== -1 && settings.cardsPerSession > 0) {
      processedCards = processedCards.slice(0, settings.cardsPerSession);
    }

    return processedCards;
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
        <div className="lg:container md:px-4 sm:px-4 xs:px-2 lg:mx-auto lg:px-6 px-4 py-8">
          {/* Show Flashcard Practice if category is selected */}
          {selectedCategory ? (
            <FlashcardPractice
              flashcards={practiceFlashcards}
              categoryName={selectedCategory}
              level={selectedLevel}
              onBack={handleBackToCategories}
              showExamples={settings.showExamples}
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
