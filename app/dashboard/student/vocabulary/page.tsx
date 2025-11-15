'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';
import { useRemNoteCategories } from '@/lib/hooks/useRemNoteCategories';

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

interface VocabularyEntry {
  id: string;
  german: string;
  english: string;
  category: string;
  level: CEFRLevel;
}

export default function VocabularyPage() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get categories for selected level
  const { categories } = useRemNoteCategories(selectedLevel);

  // Get all vocabulary entries for selected level
  const vocabularyEntries = useMemo(() => {
    const levelData = levelDataMap[selectedLevel];
    return levelData.flashcards.map((card: any) => ({
      id: card.id,
      german: card.german,
      english: card.english,
      category: card.category,
      level: selectedLevel,
    })) as VocabularyEntry[];
  }, [selectedLevel]);

  // Filter and sort vocabulary
  const filteredVocabulary = useMemo(() => {
    let filtered = vocabularyEntries;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.german.toLowerCase().includes(query) ||
          entry.english.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((entry) => entry.category === selectedCategory);
    }

    // Sort by German (A-Z)
    filtered.sort((a, b) => a.german.localeCompare(b.german, 'de'));

    return filtered;
  }, [vocabularyEntries, searchQuery, selectedCategory]);

  // Group by first letter
  const groupedVocabulary = useMemo(() => {
    const groups: { [key: string]: VocabularyEntry[] } = {};

    filteredVocabulary.forEach((entry) => {
      const firstLetter = entry.german[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(entry);
    });

    return groups;
  }, [filteredVocabulary]);

  const alphabeticalKeys = Object.keys(groupedVocabulary).sort();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Vocabulary Dictionary"
        subtitle="Browse and search German vocabulary by CEFR level"
      />

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Vocabulary ({filteredVocabulary.length})
              </h5>
            </div>

            {/* Level Selector */}
            <div>
              <CEFRLevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                size="sm"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search German or English..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Dictionary Content */}
        <div className="bg-white shadow-sm overflow-hidden">
          {filteredVocabulary.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="mx-auto w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div>
              {alphabeticalKeys.map((letter) => (
                <div key={letter} className="border-b border-gray-200 last:border-b-0">
                  {/* Letter Header */}
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <span className="text-2xl font-black text-brand-purple mr-3">{letter}</span>
                      <span className="text-sm text-gray-500 font-medium">
                        {groupedVocabulary[letter].length} {groupedVocabulary[letter].length === 1 ? 'word' : 'words'}
                      </span>
                    </div>
                  </div>

                  {/* Word List */}
                  <div className="divide-y divide-gray-100">
                    {groupedVocabulary[letter].map((entry, index) => (
                      <VocabularyRow key={entry.id} entry={entry} colorIndex={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Color schemes for vocabulary rows (similar to CEFR selector)
const ROW_COLOR_SCHEMES = [
  { bg: 'hover:bg-blue-100', text: 'group-hover:text-blue-900', badge: 'group-hover:bg-blue-500' },
  { bg: 'hover:bg-emerald-100', text: 'group-hover:text-emerald-900', badge: 'group-hover:bg-emerald-500' },
  { bg: 'hover:bg-amber-100', text: 'group-hover:text-amber-900', badge: 'group-hover:bg-amber-500' },
  { bg: 'hover:bg-purple-100', text: 'group-hover:text-purple-900', badge: 'group-hover:bg-purple-500' },
  { bg: 'hover:bg-pink-100', text: 'group-hover:text-pink-900', badge: 'group-hover:bg-pink-500' },
  { bg: 'hover:bg-indigo-100', text: 'group-hover:text-indigo-900', badge: 'group-hover:bg-indigo-500' },
];

function VocabularyRow({ entry, colorIndex }: { entry: VocabularyEntry; colorIndex: number }) {
  const colorScheme = ROW_COLOR_SCHEMES[colorIndex % ROW_COLOR_SCHEMES.length];

  return (
    <div className={`group ${colorScheme.bg} px-6 py-3 transition-all duration-200 cursor-pointer`}>
      <div className="grid grid-cols-[200px,1fr,auto] gap-16 items-center">
        {/* German Word */}
        <div className="min-w-0">
          <span className={`text-base font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200`}>
            {entry.german}
          </span>
        </div>

        {/* English Translation */}
        <div className="min-w-0">
          <span className={`text-sm text-gray-600 ${colorScheme.text} transition-colors duration-200`}>
            {entry.english}
          </span>
        </div>

        {/* Category Badge */}
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 ${colorScheme.badge} group-hover:text-white transition-all duration-200`}>
            {entry.category}
          </span>
        </div>
      </div>
    </div>
  );
}
