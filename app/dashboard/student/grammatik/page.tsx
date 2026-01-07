"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import {
  useGrammarReviews,
  useSaveGrammarReview,
} from "@/lib/hooks/useGrammarExercises";
import { usePersistedLevel } from "@/lib/hooks/usePersistedLevel";
import { useGrammarPracticeSession } from "@/lib/hooks/useGrammarPracticeSession";
import { useFilteredSentences } from "@/lib/hooks/useFilteredSentences";
import { GrammarPracticeView } from "@/components/grammar/GrammarPracticeView";
import { GrammarSentencesView } from "@/components/grammar/GrammarSentencesView";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import { applyGrammarSettings } from "@/lib/utils/grammarSelection";
import { GrammarRulesListView } from "./GrammarRulesListView";
import { levelDataMap, sentenceDataMap, GrammarRule } from "./constants";

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

      <GrammarRulesListView
        rules={rules}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        reviews={reviews}
        sentenceDataMap={sentenceDataMap}
        onRuleClick={setSelectedRule}
        onViewRule={handleViewRule}
        onRetryMistakes={handleRetryMistakes}
      />
    </div>
  );
}
