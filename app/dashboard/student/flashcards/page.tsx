'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatCardSimple } from '@/components/ui/StatCardSimple';
import { FileCard, FileGrid, FileSection } from '@/components/ui/FileCard';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { ToastProvider } from '@/components/ui/toast';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useStudyStats } from '@/lib/hooks/useFlashcards';
import { useRemNoteCategories, useRemNoteTotalCards } from '@/lib/hooks/useRemNoteCategories';
import { useFlashcardSettings } from '@/lib/hooks/useFlashcardSettings';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';

// Import level data
import a1Data from '@/lib/data/remnote/levels/a1.json';
import a2Data from '@/lib/data/remnote/levels/a2.json';
import b1Data from '@/lib/data/remnote/levels/b1.json';
import b2Data from '@/lib/data/remnote/levels/b2.json';
import c1Data from '@/lib/data/remnote/levels/c1.json';
import c2Data from '@/lib/data/remnote/levels/c2.json';

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
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [practiceFlashcards, setPracticeFlashcards] = useState<any[]>([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  // Fetch real data from Firestore (with refresh key to force re-fetch after session)
  const { stats, isLoading: statsLoading } = useStudyStats(session?.user?.email || undefined, statsRefreshKey);

  // Get RemNote categories for selected level
  const { categories, isLoading: categoriesLoading } = useRemNoteCategories(selectedLevel);
  const totalRemNoteCards = useRemNoteTotalCards(selectedLevel);

  // Get flashcard settings
  const { settings } = useFlashcardSettings();

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Get flashcards for this category and level
    const levelData = levelDataMap[selectedLevel];
    let categoryFlashcards = levelData.flashcards.filter(
      (card: any) => card.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === categoryId
    ).map((card: any) => ({
      ...card,
      wordId: card.id, // Use flashcard id as wordId for now
    }));

    // Apply settings
    categoryFlashcards = applyFlashcardSettings(categoryFlashcards);

    setPracticeFlashcards(categoryFlashcards);
    setSelectedCategory(categoryName);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setPracticeFlashcards([]);
    // Refresh stats after completing session
    setStatsRefreshKey(prev => prev + 1);
  };

  const handleStartPractice = () => {
    // Get all flashcards for the selected level
    const levelData = levelDataMap[selectedLevel];
    let flashcardsWithWordId = levelData.flashcards.map((card: any) => ({
      ...card,
      wordId: card.id, // Use flashcard id as wordId for now
    }));

    // Apply settings
    flashcardsWithWordId = applyFlashcardSettings(flashcardsWithWordId);

    setPracticeFlashcards(flashcardsWithWordId);
    setSelectedCategory('All Categories');
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
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Flashcards 📚</h1>
                <p className="text-gray-600 mt-1">Master German vocabulary with spaced repetition</p>
              </div>
              <button
                onClick={handleStartPractice}
                className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600"
              >
                Start Practice
              </button>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
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
            {/* Loading State */}
            {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-piku-purple-dark"></div>
              <p className="mt-2 text-gray-600">Loading your stats...</p>
            </div>
          </div>
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

        {/* Level Selector - Split Button Style */}
        <div className="mb-8">
          <div className="flex w-full gap-1">
            {Object.values(CEFRLevel).map((level, index) => {
              const info = CEFRLevelInfo[level];
              const isSelected = selectedLevel === level;
              const isFirst = index === 0;
              const isLast = index === Object.values(CEFRLevel).length - 1;

              // Determine border radius based on position
              let borderRadius = '';
              if (isFirst) {
                borderRadius = 'rounded-l-[20px] rounded-r-[5px]';
              } else if (isLast) {
                borderRadius = 'rounded-l-[5px] rounded-r-[20px]';
              } else {
                borderRadius = 'rounded-[5px]';
              }

              // Color scheme similar to stat cards
              let bgColor = 'bg-blue-100';
              let iconBgColor = 'bg-blue-500';
              let textColor = 'text-blue-900';
              let hoverColor = 'hover:bg-blue-200';

              if (index === 0) { // A1
                bgColor = 'bg-blue-100';
                iconBgColor = 'bg-blue-500';
                textColor = 'text-blue-900';
                hoverColor = 'hover:bg-blue-200';
              } else if (index === 1) { // A2
                bgColor = 'bg-emerald-100';
                iconBgColor = 'bg-emerald-500';
                textColor = 'text-emerald-900';
                hoverColor = 'hover:bg-emerald-200';
              } else if (index === 2) { // B1
                bgColor = 'bg-amber-100';
                iconBgColor = 'bg-amber-500';
                textColor = 'text-amber-900';
                hoverColor = 'hover:bg-amber-200';
              } else if (index === 3) { // B2
                bgColor = 'bg-purple-100';
                iconBgColor = 'bg-purple-500';
                textColor = 'text-purple-900';
                hoverColor = 'hover:bg-purple-200';
              } else if (index === 4) { // C1
                bgColor = 'bg-pink-100';
                iconBgColor = 'bg-pink-500';
                textColor = 'text-pink-900';
                hoverColor = 'hover:bg-pink-200';
              } else { // C2
                bgColor = 'bg-indigo-100';
                iconBgColor = 'bg-indigo-500';
                textColor = 'text-indigo-900';
                hoverColor = 'hover:bg-indigo-200';
              }

              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`
                    flex-1 px-4 py-4 transition-all duration-200
                    ${borderRadius}
                    ${isSelected
                      ? `${iconBgColor} text-white`
                      : `${bgColor} ${textColor} ${hoverColor}`
                    }
                  `}
                >
                  <div className="text-2xl font-black mb-1">{level}</div>
                  <div className={`text-xs font-medium whitespace-nowrap ${isSelected ? 'text-white opacity-90' : 'opacity-70'}`}>
                    {info.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vocabulary Categories */}
        <FileSection title={`${selectedLevel} Vocabulary Categories`}>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-piku-purple-dark"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            </div>
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
              {categories.map((category) => (
                <FileCard
                  key={category.id}
                  icon={
                    <div className="text-4xl">{category.icon}</div>
                  }
                  name={category.name}
                  size={`${category.cardCount} cards`}
                  onClick={() => handleCategoryClick(category.id, category.name)}
                  onMenuClick={() => console.log('Menu:', category.name)}
                />
              ))}
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
            <button
              onClick={handleStartPractice}
              className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              Start Practice Session
            </button>
          </div>
        </div>
          </>
        )}
      </div>
      </div>
    </ToastProvider>
  );
}
