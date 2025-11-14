'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';

// Import letter format data
import a1Data from '@/lib/data/letters/levels/a1.json';
import a2Data from '@/lib/data/letters/levels/a2.json';
import b1Data from '@/lib/data/letters/levels/b1.json';
import b2Data from '@/lib/data/letters/levels/b2.json';
import c1Data from '@/lib/data/letters/levels/c1.json';
import c2Data from '@/lib/data/letters/levels/c2.json';

const levelDataMap = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

interface LetterFormat {
  id: string;
  title: string;
  category: string;
  description: string;
  format: string[];
  example: string;
  phrases: string[];
  level: CEFRLevel;
}

export default function LetterWritingPage() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get all letter formats for selected level
  const letterFormats = useMemo(() => {
    const levelData = levelDataMap[selectedLevel];
    return levelData.formats.map((format: any) => ({
      ...format,
      level: selectedLevel,
    })) as LetterFormat[];
  }, [selectedLevel]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(letterFormats.map((format) => format.category))
    );
    return uniqueCategories.sort();
  }, [letterFormats]);

  // Filter letter formats
  const filteredFormats = useMemo(() => {
    let filtered = letterFormats;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (format) =>
          format.title.toLowerCase().includes(query) ||
          format.description.toLowerCase().includes(query) ||
          format.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((format) => format.category === selectedCategory);
    }

    return filtered;
  }, [letterFormats, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Letter Writing Guide"
        subtitle="Learn how to write German letters and emails by CEFR level"
      />

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Letter Formats ({filteredFormats.length})
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
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search letter formats..."
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

        {/* Letter Formats Content */}
        <div className="bg-white shadow-sm overflow-hidden">
          {filteredFormats.length === 0 ? (
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
            <div className="divide-y divide-gray-100">
              {filteredFormats.map((format, index) => (
                <LetterFormatCard key={format.id} format={format} colorIndex={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Color schemes for letter format cards
const CARD_COLOR_SCHEMES = [
  { bg: 'hover:bg-blue-100', text: 'group-hover:text-blue-900', badge: 'group-hover:bg-blue-500', border: 'border-blue-500' },
  { bg: 'hover:bg-emerald-100', text: 'group-hover:text-emerald-900', badge: 'group-hover:bg-emerald-500', border: 'border-emerald-500' },
  { bg: 'hover:bg-amber-100', text: 'group-hover:text-amber-900', badge: 'group-hover:bg-amber-500', border: 'border-amber-500' },
  { bg: 'hover:bg-purple-100', text: 'group-hover:text-purple-900', badge: 'group-hover:bg-purple-500', border: 'border-purple-500' },
  { bg: 'hover:bg-pink-100', text: 'group-hover:text-pink-900', badge: 'group-hover:bg-pink-500', border: 'border-pink-500' },
  { bg: 'hover:bg-indigo-100', text: 'group-hover:text-indigo-900', badge: 'group-hover:bg-indigo-500', border: 'border-indigo-500' },
];

function LetterFormatCard({ format, colorIndex }: { format: LetterFormat; colorIndex: number }) {
  const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];

  return (
    <div className={`group ${colorScheme.bg} px-6 py-6 transition-all duration-200`}>
      <div className="space-y-4">
        {/* Title and Category */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✉️</span>
              <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200`}>
                {format.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {format.description}
            </p>
          </div>

          {/* Category Badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 ${colorScheme.badge} group-hover:text-white transition-all duration-200`}>
              {format.category}
            </span>
          </div>
        </div>

        {/* Letter Structure */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase">Structure:</h4>
          {format.format.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-gray-50 px-3 py-2 border border-gray-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm text-gray-900 font-medium">{step}</span>
            </div>
          ))}
        </div>

        {/* Useful Phrases */}
        {format.phrases && format.phrases.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase">Useful Phrases:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {format.phrases.map((phrase, idx) => (
                <div key={idx} className={`bg-white/80 px-3 py-2 border ${colorScheme.border} border-opacity-30 hover:border-opacity-100 transition-all duration-200 cursor-pointer`}>
                  <span className="text-sm text-gray-900">{phrase}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 uppercase">Example:</h4>
          <div className="bg-white border-l-4 border-gray-400 p-4">
            <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">{format.example}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
