/**
 * Grammar Practice View Component
 * Handles practice session UI for grammar exercises
 */

'use client';

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GrammarSentencePractice } from "@/components/grammar/GrammarSentencePractice";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface GrammarPracticeViewProps {
  selectedRuleData: {
    id: string;
    title: string;
    category: string;
    description: string;
    examples: string[];
    notes: string;
  } | null;
  selectedRuleSentences: any[];
  isPracticeMode: boolean;
  currentSessionResults: { sentenceId: string; difficulty: string }[];
  onComplete: (results: { sentenceId: string; difficulty: string }[], shouldExit?: boolean) => Promise<void>;
  onProgress: (results: { sentenceId: string; difficulty: string }[]) => void;
  onBack: () => void;
}

export function GrammarPracticeView({
  selectedRuleData,
  selectedRuleSentences,
  isPracticeMode,
  currentSessionResults,
  onComplete,
  onProgress,
  onBack,
}: GrammarPracticeViewProps) {
  const practiceTitle = isPracticeMode
    ? "SRS Practice Session"
    : selectedRuleData?.title || "Grammar Practice";

  const handleEndSession = () => {
    if (currentSessionResults.length > 0) {
      onComplete(currentSessionResults, true);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader
        title="Grammar Practice"
        subtitle={
          isPracticeMode
            ? `Reviewing ${selectedRuleSentences.length} due sentences`
            : `Practicing: ${practiceTitle}`
        }
        backButton={{
          label: "Back to Rules",
          onClick: onBack,
        }}
        actions={
          <ActionButton
            onClick={handleEndSession}
            variant={currentSessionResults.length > 0 ? "mint" : "gray"}
            icon={
              currentSessionResults.length > 0 ? (
                <ActionButtonIcons.Check />
              ) : (
                <ActionButtonIcons.X />
              )
            }
          >
            {currentSessionResults.length > 0
              ? `End Session (${currentSessionResults.length})`
              : "End Session"}
          </ActionButton>
        }
      />
      <div className="container mx-auto px-6 mt-8">
        <GrammarSentencePractice
          sentences={selectedRuleSentences}
          ruleTitle={practiceTitle}
          onComplete={onComplete}
          onProgress={onProgress}
        />
      </div>
    </div>
  );
}
