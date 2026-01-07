"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { CategoryList } from "@/components/ui/CategoryList";
import { CEFRLevel } from "@/lib/models/cefr";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import {
  useGrammarReviews,
  useSaveGrammarReview,
} from "@/lib/hooks/useGrammarExercises";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { useGrammarPracticeSession } from "@/lib/hooks/useGrammarPracticeSession";
import { useFilteredSentences } from "@/lib/hooks/useFilteredSentences";
import { GrammarRuleCardWithProgress } from "@/components/grammar/GrammarRuleCardWithProgress";
import { GrammarPracticeView } from "@/components/grammar/GrammarPracticeView";
import { GrammarSentencesView } from "@/components/grammar/GrammarSentencesView";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { applyGrammarSettings } from "@/lib/utils/grammarSelection";

// Import existing grammar data from grammar guide
import a1Data from "@/lib/data/grammar/levels/a1.json";
import a2Data from "@/lib/data/grammar/levels/a2.json";
import b1Data from "@/lib/data/grammar/levels/b1.json";
import b2Data from "@/lib/data/grammar/levels/b2.json";
import c1Data from "@/lib/data/grammar/levels/c1.json";
import c2Data from "@/lib/data/grammar/levels/c2.json";

// Import sentence data
import a1Sentences from "@/lib/data/grammar/sentences/a1.json";
import a2Sentences from "@/lib/data/grammar/sentences/a2.json";
import b1Sentences from "@/lib/data/grammar/sentences/b1.json";
import b2Sentences from "@/lib/data/grammar/sentences/b2.json";

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
  {
    bg: "hover:bg-blue-100",
    text: "group-hover:text-blue-900",
    badge: "group-hover:bg-blue-500",
    border: "hover:border-l-blue-500",
  },
  {
    bg: "hover:bg-emerald-100",
    text: "group-hover:text-emerald-900",
    badge: "group-hover:bg-emerald-500",
    border: "hover:border-l-emerald-500",
  },
  {
    bg: "hover:bg-amber-100",
    text: "group-hover:text-amber-900",
    badge: "group-hover:bg-amber-500",
    border: "hover:border-l-amber-500",
  },
  {
    bg: "hover:bg-purple-100",
    text: "group-hover:text-purple-900",
    badge: "group-hover:bg-purple-500",
    border: "hover:border-l-purple-500",
  },
  {
    bg: "hover:bg-pink-100",
    text: "group-hover:text-pink-900",
    badge: "group-hover:bg-pink-500",
    border: "hover:border-l-pink-500",
  },
  {
    bg: "hover:bg-indigo-100",
    text: "group-hover:text-indigo-900",
    badge: "group-hover:bg-indigo-500",
    border: "hover:border-l-indigo-500",
  },
];

export default function GrammatikPracticePage() {
  const { session } = useFirebaseAuth();
  const [selectedLevel, setSelectedLevel] = usePersistedLevel(
    "grammatik-last-level"
  );
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentSessionResults, setCurrentSessionResults] = useState<
    { sentenceId: string; difficulty: string }[]
  >([]);
  const [nextDueInfo, setNextDueInfo] = useState<{ count: number; nextDueDate: number } | undefined>();
  const [upcomingSentences, setUpcomingSentences] = useState<any[]>([]);

  // Load grammar rules from JSON files
  const rules = useMemo(() => {
    const levelData = levelDataMap[selectedLevel];
    return levelData.rules as GrammarRule[];
  }, [selectedLevel]);

  // Fetch user's progress
  const {
    reviews,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useGrammarReviews(session?.user?.email);
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

  // Start practice with only failed sentences for a rule (respecting SRS intervals)
  const handleRetryMistakes = (ruleId: string) => {
    const sentenceData = sentenceDataMap[selectedLevel];
    if (!sentenceData || !sentenceData.sentences) return;

    // Get sentence IDs that were failed (masteryLevel < 50)
    const failedSentenceIds = reviews
      .filter((r) => r.ruleId === ruleId && r.masteryLevel < 50)
      .map((r) => r.sentenceId);

    // Get the actual sentence objects
    const failedSentences = sentenceData.sentences.filter(
      (s: any) => failedSentenceIds.includes(s.sentenceId) && !s.english.includes("[TODO]")
    );

    if (failedSentences.length > 0) {
      // Apply SRS filtering - only show failed sentences that are actually due now
      const { sentences: dueSentences } = applyGrammarSettings(
        failedSentences,
        reviews,
        {
          randomizeOrder: true,
          sentencesPerSession: -1, // No limit, show all due failed sentences
        }
      );

      if (dueSentences.length === 0) {
        alert("No failed sentences are due for review yet. They're still in the SRS queue!");
        return;
      }

      setSelectedRule(ruleId);
      setPracticeSentences(dueSentences);
      setIsPracticeMode(true);
      setIsViewMode(false);
      setCurrentSessionResults([]);
    }
  };

  // View all sentences without practicing
  const handleViewRule = (ruleId: string) => {
    setSelectedRule(ruleId);
    setIsViewMode(true);
    setIsPracticeMode(false);
    setPracticeSentences([]);
    setCurrentSessionResults([]);
  };

  // Get sentences for selected rule or practice mode
  const selectedRuleData = useMemo(() => {
    if (!selectedRule) return null;
    return rules.find((r) => r.id === selectedRule);
  }, [selectedRule, rules]);

  const selectedRuleSentences = useFilteredSentences({
    selectedRule,
    selectedLevel,
    isPracticeMode,
    practiceSentences,
    sentenceDataMap,
    reviews,
  });

  const handleStartPractice = () => {
    const ruleId = startPractice();
    if (ruleId) {
      setSelectedRule(ruleId);
      setCurrentSessionResults([]);
    }
  };

  const onPracticeComplete = async (
    results: { sentenceId: string; difficulty: string }[],
    shouldExit: boolean = true
  ) => {
    await handlePracticeComplete(results);
    if (shouldExit) {
      setSelectedRule(null);
      setCurrentSessionResults([]);
    }
  };

  // Handle back from practice/view mode
  const handleBackToRules = () => {
    setSelectedRule(null);
    setIsPracticeMode(false);
    setIsViewMode(false);
    setPracticeSentences([]);
    setCurrentSessionResults([]);
  };

  if (selectedRule) {
    // View Mode - just display sentences
    if (isViewMode) {
      const sentenceData = sentenceDataMap[selectedLevel];
      const allSentences = sentenceData?.sentences?.filter(
        (s: any) => s.ruleId === selectedRule && !s.english.includes("[TODO]")
      ) || [];

      return (
        <GrammarSentencesView
          selectedRuleData={selectedRuleData}
          allSentences={allSentences}
          onBack={handleBackToRules}
        />
      );
    }

    // Practice Mode
    return (
      <GrammarPracticeView
        selectedRuleData={selectedRuleData}
        selectedRuleSentences={selectedRuleSentences}
        isPracticeMode={isPracticeMode}
        currentSessionResults={currentSessionResults}
        onComplete={onPracticeComplete}
        onProgress={setCurrentSessionResults}
        onBack={handleBackToRules}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="opacity-0 animate-fade-in-down" style={{ animationFillMode: 'forwards' }}>
        <DashboardHeader
          title="Grammatik Practice"
          subtitle="Practice German grammar with sentence exercises"
          backButton={{
            label: "Back to Dashboard",
            onClick: () => window.location.href = '/dashboard/student',
          }}
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
      </div>

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white border border-gray-200 shadow-sm mb-6 opacity-0 animate-fade-in-up animation-delay-100 hover:border-gray-300 transition-all duration-500 ease-out" style={{ animationFillMode: 'forwards' }}>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                Grammar Rules ({rules.length})
              </h5>
            </div>

            {/* Level Selector */}
            <div className="transition-all duration-500 ease-out">
              <CEFRLevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                size="md"
                showDescription={true}
              />
            </div>
          </div>
        </div>

        {/* Grammar Rules by Category */}
        {rules.length > 0 && (
          <div className="opacity-0 animate-fade-in-up animation-delay-200" style={{ animationFillMode: 'forwards' }}>
            <CategoryList
              categories={categories.map((category, categoryIndex) => {
                const items = rulesByCategory[category].map((rule, ruleIndex) => {
                  const colorScheme =
                    CARD_COLOR_SCHEMES[
                      ruleIndex % CARD_COLOR_SCHEMES.length
                    ];

                  // Calculate staggered delay for each card (smoother, smaller increments)
                  const cardDelay = (categoryIndex * 50 + ruleIndex * 30) % 500;
                  const delayClass = cardDelay > 0 ? `animation-delay-${Math.min(cardDelay, 500)}` : '';

                  return (
                    <div
                      key={rule.id}
                      className={`opacity-0 animate-fade-in-up ${delayClass} transition-all duration-500 ease-out hover:translate-x-1`}
                      style={{ animationFillMode: 'forwards' }}
                    >
                      <GrammarRuleCardWithProgress
                        rule={rule}
                        reviews={reviews}
                        sentenceDataMap={sentenceDataMap}
                        selectedLevel={selectedLevel}
                        colorScheme={colorScheme}
                        onClick={() => setSelectedRule(rule.id)}
                        onView={() => handleViewRule(rule.id)}
                        onRetryMistakes={() => handleRetryMistakes(rule.id)}
                      />
                    </div>
                  );
                });

                return {
                  key: category,
                  header: category,
                  items,
                };
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
