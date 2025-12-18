'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useGrammarReviews, useSaveGrammarReview } from '@/lib/hooks/useGrammarExercises';
import { usePersistedLevel } from '@/lib/hooks/usePersistedLevel';
import { useGrammarPracticeSession } from '@/lib/hooks/useGrammarPracticeSession';
import { GrammarSentencePractice } from '@/components/grammar/GrammarSentencePractice';
import { GrammarRuleCard } from '@/components/grammar/GrammarRuleCard';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

// Import existing grammar data from grammar guide
import a1Data from '@/lib/data/grammar/levels/a1.json';
import a2Data from '@/lib/data/grammar/levels/a2.json';
import b1Data from '@/lib/data/grammar/levels/b1.json';
import b2Data from '@/lib/data/grammar/levels/b2.json';
import c1Data from '@/lib/data/grammar/levels/c1.json';
import c2Data from '@/lib/data/grammar/levels/c2.json';

// Import sentence data
import a1Sentences from '@/lib/data/grammar/sentences/a1.json';
import a2Sentences from '@/lib/data/grammar/sentences/a2.json';
import b1Sentences from '@/lib/data/grammar/sentences/b1.json';
import b2Sentences from '@/lib/data/grammar/sentences/b2.json';

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
  [CEFRLevel.A2]: a2Sentences,
  [CEFRLevel.B1]: b1Sentences,
  [CEFRLevel.B2]: b2Sentences,
  // TODO: Add other levels when sentence files are created
  // [CEFRLevel.C1]: c1Sentences,
  // [CEFRLevel.C2]: c2Sentences,
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
  const { reviews, isLoading: reviewsLoading, refetch: refetchReviews } = useGrammarReviews(session?.user?.email);
  const { saveReview } = useSaveGrammarReview();

  // Practice session hook
  const {
    isPracticeMode,
    practiceSentences,
    dueSentencesCount,
    setIsPracticeMode,
    setPracticeSentences,
    handlePracticeComplete,
    handleStartPractice: startPractice,
  } = useGrammarPracticeSession({
    selectedLevel,
    sentenceDataMap,
    reviews,
    session,
    saveReview,
    refetchReviews,
  });

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
    // Get total available sentences for this rule
    const sentenceData = sentenceDataMap[selectedLevel];
    const totalSentences = sentenceData?.sentences?.filter(
      (s: any) => s.ruleId === ruleId && !s.english.includes('[TODO')
    ).length || 0;

    // Get reviewed sentences
    const ruleReviews = reviews.filter((r) => r.ruleId === ruleId);
    const practiced = ruleReviews.length;
    const completed = ruleReviews.filter((r) => r.masteryLevel >= 80).length;
    const percentage = totalSentences > 0 ? Math.round((practiced / totalSentences) * 100) : 0;

    return {
      practiced,
      total: totalSentences,
      completed,
      percentage
    };
  };

  // Get sentences for selected rule or practice mode
  const selectedRuleData = useMemo(() => {
    if (!selectedRule) return null;
    return rules.find((r) => r.id === selectedRule);
  }, [selectedRule, rules]);

  const selectedRuleSentences = useMemo(() => {
    // Practice mode: return the practice sentences we set
    if (isPracticeMode && practiceSentences.length > 0) {
      return practiceSentences;
    }

    // Regular mode: filter by selected rule
    if (!selectedRule) return [];

    const sentenceData = sentenceDataMap[selectedLevel];
    if (!sentenceData || !sentenceData.sentences) return [];

    // Filter sentences for this rule (exclude [TODO] placeholders)
    return sentenceData.sentences.filter(
      (s: any) => s.ruleId === selectedRule && !s.english.includes('[TODO]')
    );
  }, [selectedRule, selectedLevel, isPracticeMode, practiceSentences]);

  const handleStartPractice = () => {
    const ruleId = startPractice();
    if (ruleId) {
      setSelectedRule(ruleId);
    }
  };

  const onPracticeComplete = async (results: { sentenceId: string; difficulty: string }[]) => {
    await handlePracticeComplete(results);
    setSelectedRule(null);
  };

  if (selectedRule) {
    // Determine title based on mode
    const practiceTitle = isPracticeMode
      ? 'SRS Practice Session'
      : selectedRuleData?.title || 'Grammar Practice';

    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DashboardHeader
          title="Grammar Practice"
          subtitle={isPracticeMode ? `Reviewing ${selectedRuleSentences.length} due sentences` : `Practicing: ${practiceTitle}`}
          backButton={{
            label: "Back to Rules",
            onClick: () => {
              setSelectedRule(null);
              setIsPracticeMode(false);
              setPracticeSentences([]);
            },
          }}
        />
        <div className="container mx-auto px-6 mt-8">
          <GrammarSentencePractice
            sentences={selectedRuleSentences}
            ruleTitle={practiceTitle}
            onComplete={onPracticeComplete}
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
        actions={
          dueSentencesCount > 0 ? (
            <ActionButton
              onClick={handleStartPractice}
              variant="purple"
              icon={<ActionButtonIcons.Play />}
            >
              Practice ({dueSentencesCount} due)
            </ActionButton>
          ) : null
        }
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
                        <GrammarRuleCard
                          key={rule.id}
                          rule={rule}
                          progress={progress}
                          colorScheme={colorScheme}
                          onClick={() => setSelectedRule(rule.id)}
                        />
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
