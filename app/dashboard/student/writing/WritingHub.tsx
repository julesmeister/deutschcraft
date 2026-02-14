/**
 * WritingHub Component
 * Main hub for selecting exercise types and viewing stats/history
 */

import { CEFRLevel } from "@/lib/models/cefr";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { WritingHistory } from "@/components/writing/WritingHistory";
import { WritingTipsCard } from "@/components/writing/WritingTipsCard";
import {
  TranslationExercise,
  CreativeWritingExercise,
} from "@/lib/models/writing";
import { EmailTemplate } from "@/lib/data/emailTemplates";
import { LetterTemplate } from "@/lib/data/letterTemplates";
import { WritingSubmission } from "@/lib/models/writing";
import { useUserQuizStats, useUserQuizzes } from "@/lib/hooks/useReviewQuizzes";
import { useMemo } from "react";
import { WritingStatsBar } from "./hub/WritingStatsBar";
import { ExerciseTypeSelector } from "./hub/ExerciseTypeSelector";
import { FreestyleSection } from "./hub/FreestyleSection";
import { ExerciseSelectorWrapper } from "./hub/ExerciseSelectorWrapper";
import { motion } from "framer-motion";

type ExerciseType =
  | "translation"
  | "creative"
  | "email"
  | "letters"
  | "freestyle"
  | null;

interface WritingStats {
  totalExercisesCompleted: number;
  averageOverallScore: number;
  currentStreak: number;
  totalWordsWritten: number;
}

interface WritingHubProps {
  selectedLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  selectedExerciseType: ExerciseType;
  onExerciseTypeSelect: (type: ExerciseType) => void;
  writingStats: WritingStats | undefined;
  statsLoading: boolean;
  submissions: WritingSubmission[];
  submissionsLoading: boolean;
  showHistory: boolean;
  onToggleHistory: () => void;
  onViewSubmission: (submissionId: string) => void;
  filteredTranslationExercises: TranslationExercise[];
  filteredCreativeExercises: CreativeWritingExercise[];
  filteredEmailTemplates: EmailTemplate[];
  filteredLetterTemplates: LetterTemplate[];
  onTranslationSelect: (exercise: TranslationExercise) => void;
  onCreativeSelect: (exercise: CreativeWritingExercise) => void;
  onEmailSelect: (template: EmailTemplate) => void;
  onLetterSelect: (template: LetterTemplate) => void;
  onFreestyleSelect: () => void;
  userEmail?: string | null;
}

export function WritingHub({
  selectedLevel,
  onLevelChange,
  selectedExerciseType,
  onExerciseTypeSelect,
  writingStats,
  statsLoading,
  submissions,
  submissionsLoading,
  showHistory,
  onToggleHistory,
  onViewSubmission,
  filteredTranslationExercises,
  filteredCreativeExercises,
  filteredEmailTemplates,
  filteredLetterTemplates,
  onTranslationSelect,
  onCreativeSelect,
  onEmailSelect,
  onLetterSelect,
  onFreestyleSelect,
  userEmail,
}: WritingHubProps) {
  const { data: quizStats } = useUserQuizStats(userEmail || null);
  const { data: userQuizzes = [] } = useUserQuizzes(userEmail || null);

  // Combine submissions and quizzes, sorted by date
  const combinedSubmissions = useMemo(() => {
    const items = [
      ...submissions,
      ...userQuizzes
        .filter((quiz) => quiz.status === "completed")
        .map((quiz) => ({
          ...quiz,
          isQuiz: true,
          submissionId: quiz.quizId,
          exerciseType: "quiz" as const,
          status: "reviewed" as const,
          wordCount: quiz.totalBlanks,
          submittedAt: quiz.completedAt || quiz.startedAt,
          updatedAt: quiz.updatedAt,
        })),
    ];

    return items.sort((a, b) => {
      const dateA = a.submittedAt || a.updatedAt || 0;
      const dateB = b.submittedAt || b.updatedAt || 0;
      return dateB - dateA;
    });
  }, [submissions, userQuizzes]);

  const attemptedExerciseIds = new Set(
    submissions
      .map((submission) => submission.exerciseId)
      .filter((id): id is string => !!id)
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="mb-8">
        <CEFRLevelSelector
          selectedLevel={selectedLevel}
          onLevelChange={onLevelChange}
          colorScheme="default"
          showDescription={true}
          size="sm"
        />
      </motion.div>

      <motion.div variants={item}>
        <WritingStatsBar
          writingStats={writingStats}
          quizStats={quizStats}
          isLoading={statsLoading}
        />
      </motion.div>

      <motion.div variants={item}>
        <ExerciseTypeSelector
          selectedType={selectedExerciseType}
          onTypeSelect={onExerciseTypeSelect}
          translationCount={filteredTranslationExercises.length}
          creativeCount={filteredCreativeExercises.length}
          emailCount={filteredEmailTemplates.length}
          letterCount={filteredLetterTemplates.length}
        />
      </motion.div>

      {selectedExerciseType === "freestyle" && (
        <motion.div
          variants={item}
          key="freestyle-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FreestyleSection />
        </motion.div>
      )}

      <motion.div
        variants={item}
        key={`${selectedExerciseType || "all"}-${selectedLevel}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ExerciseSelectorWrapper
          selectedType={selectedExerciseType}
          translationExercises={filteredTranslationExercises}
          creativeExercises={filteredCreativeExercises}
          emailTemplates={filteredEmailTemplates}
          letterTemplates={filteredLetterTemplates}
          attemptedExerciseIds={attemptedExerciseIds}
          onTranslationSelect={onTranslationSelect}
          onCreativeSelect={onCreativeSelect}
          onEmailSelect={onEmailSelect}
          onLetterSelect={onLetterSelect}
        />
      </motion.div>

      <motion.div variants={item} className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">
            Recent Submissions
          </h2>
          {combinedSubmissions.length > 3 && (
            <button
              onClick={onToggleHistory}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showHistory ? "Show Less" : "View All"}
            </button>
          )}
        </div>

        <WritingHistory
          submissions={
            showHistory ? combinedSubmissions : combinedSubmissions.slice(0, 3)
          }
          onViewSubmission={onViewSubmission}
          isLoading={submissionsLoading}
        />
      </motion.div>

      <motion.div variants={item} className="mt-8">
        <WritingTipsCard />
      </motion.div>
    </motion.div>
  );
}
