'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useGrammarReviews } from '@/lib/hooks/useGrammarExercises';
import { usePersistedLevel } from '@/lib/hooks/usePersistedLevel';
import { GrammarSentencePractice } from '@/components/grammar/GrammarSentencePractice';

// Import existing grammar data from grammar guide
import a1Data from '@/lib/data/grammar/levels/a1.json';
import a2Data from '@/lib/data/grammar/levels/a2.json';
import b1Data from '@/lib/data/grammar/levels/b1.json';
import b2Data from '@/lib/data/grammar/levels/b2.json';
import c1Data from '@/lib/data/grammar/levels/c1.json';
import c2Data from '@/lib/data/grammar/levels/c2.json';

// Import sentence data
import a1Sentences from '@/lib/data/grammar/sentences/a1.json';

const levelDataMap = {
  [CEFRLevel.A1]: a1Data,
  [CEFRLevel.A2]: a2Data,
  [CEFRLevel.B1]: b1Data,
  [CEFRLevel.B2]: b2Data,
  [CEFRLevel.C1]: c1Data,
  [CEFRLevel.C2]: c2Data,
};

const sentenceDataMap: Record<string, any> = {
  [CEFRLevel.A1]: a1Sentences,
  // TODO: Add other levels when sentence files are created
  // [CEFRLevel.A2]: a2Sentences,
  // [CEFRLevel.B1]: b1Sentences,
  // etc...
};

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
}

// Color schemes for grammar rule cards (same as grammar guide)
const CARD_COLOR_SCHEMES = [
  { bg: 'hover:bg-blue-100', text: 'group-hover:text-blue-900', badge: 'group-hover:bg-blue-500' },
  { bg: 'hover:bg-emerald-100', text: 'group-hover:text-emerald-900', badge: 'group-hover:bg-emerald-500' },
  { bg: 'hover:bg-amber-100', text: 'group-hover:text-amber-900', badge: 'group-hover:bg-amber-500' },
  { bg: 'hover:bg-purple-100', text: 'group-hover:text-purple-900', badge: 'group-hover:bg-purple-500' },
  { bg: 'hover:bg-pink-100', text: 'group-hover:text-pink-900', badge: 'group-hover:bg-pink-500' },
  { bg: 'hover:bg-indigo-100', text: 'group-hover:text-indigo-900', badge: 'group-hover:bg-indigo-500' },
];

export default function GrammatikPracticePage() {
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = usePersistedLevel('grammatik-last-level');
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  // Load grammar rules from JSON files
  const rules = useMemo(() => {
    const levelData = levelDataMap[selectedLevel];
    return levelData.rules as GrammarRule[];
  }, [selectedLevel]);

  // Fetch user's progress
  const { reviews, isLoading: reviewsLoading } = useGrammarReviews(session?.user?.email);

  // Group rules by category
  const rulesByCategory = useMemo(() => {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = [];
      }
      acc[rule.category].push(rule);
      return acc;
    }, {} as Record<string, GrammarRule[]>);
  }, [rules]);

  const categories = Object.keys(rulesByCategory).sort();

  // Calculate progress for each rule
  const getRuleProgress = (ruleId: string) => {
    const ruleReviews = reviews.filter((r) => r.ruleId === ruleId);
    if (ruleReviews.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = ruleReviews.filter((r) => r.masteryLevel >= 80).length;
    const total = ruleReviews.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  // Get sentences for selected rule
  const selectedRuleData = useMemo(() => {
    if (!selectedRule) return null;
    return rules.find((r) => r.id === selectedRule);
  }, [selectedRule, rules]);

  const selectedRuleSentences = useMemo(() => {
    if (!selectedRule) return [];

    const sentenceData = sentenceDataMap[selectedLevel];
    if (!sentenceData || !sentenceData.sentences) return [];

    // Filter sentences for this rule (exclude [TODO] placeholders)
    return sentenceData.sentences.filter(
      (s: any) => s.ruleId === selectedRule && !s.english.includes('[TODO]')
    );
  }, [selectedRule, selectedLevel]);

  const handlePracticeComplete = (results: { sentenceId: string; difficulty: string }[]) => {
    // TODO: Save progress to database
    console.log('Practice session complete:', results);

    // Return to rules list
    setSelectedRule(null);
  };

  if (selectedRule && selectedRuleData) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Grammar Practice"
          subtitle={`Practicing: ${selectedRuleData.title}`}
        />
        <div className="container mx-auto px-6 mt-8">
          <GrammarSentencePractice
            sentences={selectedRuleSentences}
            ruleTitle={selectedRuleData.title}
            onBack={() => setSelectedRule(null)}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Grammatik Practice"
        subtitle="Practice German grammar with sentence exercises"
      />

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Grammar Rules ({rules.length})
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
          </div>
        </div>

        {/* Grammar Rules by Category */}
        {rules.length > 0 && (
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categories.map((category, catIndex) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{category}</h2>
                  </div>

                  {/* Rules List */}
                  <div className="divide-y divide-gray-100">
                    {rulesByCategory[category].map((rule, ruleIndex) => {
                      const progress = getRuleProgress(rule.id);
                      const colorScheme = CARD_COLOR_SCHEMES[ruleIndex % CARD_COLOR_SCHEMES.length];

                      return (
                        <div
                          key={rule.id}
                          className={`group ${colorScheme.bg} px-6 py-4 transition-all duration-200 cursor-pointer`}
                          onClick={() => setSelectedRule(rule.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-lg font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200 mb-1`}>
                                {rule.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {rule.description}
                              </p>

                              {/* Progress Bar */}
                              {progress.total > 0 && (
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <span className="font-medium">
                                    {progress.completed}/{progress.total} sentences
                                  </span>
                                  <div className="flex-1 max-w-xs bg-gray-200 h-1.5">
                                    <div
                                      className="bg-blue-600 h-1.5 transition-all"
                                      style={{ width: `${progress.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="font-medium">{progress.percentage}%</span>
                                </div>
                              )}
                            </div>

                            {/* Action Badge */}
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center px-3 py-1 text-xs font-bold bg-gray-100 text-gray-600 ${colorScheme.badge} group-hover:text-white transition-all duration-200`}>
                                {progress.total > 0 ? 'PRACTICE' : 'START'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
