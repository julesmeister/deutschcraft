'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';

// Import grammar data
import a1Data from '@/lib/data/grammar/levels/a1.json';
import a2Data from '@/lib/data/grammar/levels/a2.json';
import b1Data from '@/lib/data/grammar/levels/b1.json';
import b2Data from '@/lib/data/grammar/levels/b2.json';
import c1Data from '@/lib/data/grammar/levels/c1.json';
import c2Data from '@/lib/data/grammar/levels/c2.json';

const levelDataMap = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
  level: CEFRLevel;
}

export default function GrammarGuidePage() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get all grammar rules for selected level
  const grammarRules = useMemo(() => {
    const levelData = levelDataMap[selectedLevel];
    return levelData.rules.map((rule: any) => ({
      ...rule,
      level: selectedLevel,
    })) as GrammarRule[];
  }, [selectedLevel]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(grammarRules.map((rule) => rule.category))
    );
    return uniqueCategories.sort();
  }, [grammarRules]);

  // Filter grammar rules
  const filteredRules = useMemo(() => {
    let filtered = grammarRules;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rule) =>
          rule.title.toLowerCase().includes(query) ||
          rule.description.toLowerCase().includes(query) ||
          rule.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((rule) => rule.category === selectedCategory);
    }

    return filtered;
  }, [grammarRules, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Grammar Guide"
        subtitle="Learn German grammar rules by CEFR level"
      />

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Grammar Rules ({filteredRules.length})
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
                placeholder="Search grammar rules..."
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

        {/* Grammar Rules Content */}
        <div className="bg-white shadow-sm overflow-hidden">
          {filteredRules.length === 0 ? (
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
              {filteredRules.map((rule, index) => (
                <GrammarRuleCard key={rule.id} rule={rule} colorIndex={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Color schemes for grammar rule cards (similar to vocabulary)
const CARD_COLOR_SCHEMES = [
  { bg: 'hover:bg-blue-100', text: 'group-hover:text-blue-900', badge: 'group-hover:bg-blue-500' },
  { bg: 'hover:bg-emerald-100', text: 'group-hover:text-emerald-900', badge: 'group-hover:bg-emerald-500' },
  { bg: 'hover:bg-amber-100', text: 'group-hover:text-amber-900', badge: 'group-hover:bg-amber-500' },
  { bg: 'hover:bg-purple-100', text: 'group-hover:text-purple-900', badge: 'group-hover:bg-purple-500' },
  { bg: 'hover:bg-pink-100', text: 'group-hover:text-pink-900', badge: 'group-hover:bg-pink-500' },
  { bg: 'hover:bg-indigo-100', text: 'group-hover:text-indigo-900', badge: 'group-hover:bg-indigo-500' },
];

function GrammarRuleCard({ rule, colorIndex }: { rule: GrammarRule; colorIndex: number }) {
  const colorScheme = CARD_COLOR_SCHEMES[colorIndex % CARD_COLOR_SCHEMES.length];
  const isPhraseCategory = rule.category === 'Phrases';

  // Phrases get special visual treatment
  if (isPhraseCategory) {
    return (
      <div className="group hover:bg-gradient-to-r hover:from-brand-yellow/20 hover:via-brand-mint/20 hover:to-white px-6 py-4 transition-all duration-200 border-l-4 border-brand-cyan">
        <div className="space-y-3">
          {/* Title with icon */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">💬</span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-cyan transition-colors duration-200">
                  {rule.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {rule.description}
              </p>
            </div>

            {/* Category Badge */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                {rule.category}
              </span>
            </div>
          </div>

          {/* Phrase Grid - All phrases shown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rule.examples.map((example, idx) => (
              <div key={idx} className="bg-white/80 px-3 py-2 border border-gray-200 hover:bg-brand-cyan/10 hover:border-brand-cyan transition-all duration-200 cursor-pointer">
                <span className="text-sm font-medium text-gray-900">{example}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          {rule.notes && (
            <p className="text-xs text-gray-500 italic pt-2">
              💡 {rule.notes}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Regular grammar rules (non-phrases)
  return (
    <div className={`group ${colorScheme.bg} px-6 py-4 transition-all duration-200 cursor-pointer`}>
      <div className="space-y-3">
        {/* Title and Category Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200 mb-1`}>
              {rule.title}
            </h3>
            <p className="text-sm text-gray-600">
              {rule.description}
            </p>
          </div>

          {/* Category Badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 ${colorScheme.badge} group-hover:text-white transition-all duration-200`}>
              {rule.category}
            </span>
          </div>
        </div>

        {/* Examples - All shown in boxes */}
        <div className="space-y-2">
          {rule.examples.map((example, idx) => (
            <div key={idx} className="bg-gray-50 px-3 py-2 border border-gray-200 hover:border-gray-400 hover:bg-white transition-all duration-150 cursor-pointer">
              <span className="text-sm text-gray-900 font-medium">{example}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {rule.notes && (
          <p className="text-xs text-gray-500 italic pt-2">
            💡 {rule.notes}
          </p>
        )}
      </div>
    </div>
  );
}
