/**
 * WritingHub Component
 * Main hub for selecting exercise types and viewing stats/history
 */

import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { TabBar } from '@/components/ui/TabBar';
import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { WritingHistory } from '@/components/writing/WritingHistory';
import { WritingTipsCard } from '@/components/writing/WritingTipsCard';
import { TranslationExerciseSelector } from '@/components/writing/TranslationExerciseSelector';
import { CreativeExerciseSelector } from '@/components/writing/CreativeExerciseSelector';
import { EmailTemplateSelector } from '@/components/writing/EmailTemplateSelector';
import { LetterTemplateSelector } from '@/components/writing/LetterTemplateSelector';
import { TranslationExercise, CreativeWritingExercise } from '@/lib/models/writing';
import { EmailTemplate } from '@/lib/data/emailTemplates';
import { LetterTemplate } from '@/lib/data/letterTemplates';
import { WritingSubmission } from '@/lib/models/writing';
import { useUserQuizStats, useUserQuizzes } from '@/lib/hooks/useReviewQuizzes';
import { useMemo } from 'react';

type ExerciseType = 'translation' | 'creative' | 'email' | 'letters' | null;

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
  userEmail,
}: WritingHubProps) {
  const { data: quizStats } = useUserQuizStats(userEmail || null);
  const { data: userQuizzes = [] } = useUserQuizzes(userEmail || null);

  // Combine submissions and quizzes, sorted by date (similar to teacher page)
  const combinedSubmissions = useMemo(() => {
    const items = [
      ...submissions,
      // Only include completed quizzes
      ...userQuizzes
        .filter(quiz => quiz.status === 'completed')
        .map(quiz => ({
          ...quiz,
          isQuiz: true,
          submissionId: quiz.quizId,
          exerciseType: 'quiz' as const,
          status: 'reviewed' as const,
          wordCount: quiz.totalBlanks,
          submittedAt: quiz.completedAt || quiz.startedAt,
          updatedAt: quiz.updatedAt,
        }))
    ];

    // Sort by date (most recent first)
    return items.sort((a, b) => {
      const dateA = a.submittedAt || a.updatedAt || 0;
      const dateB = b.submittedAt || b.updatedAt || 0;
      return dateB - dateA;
    });
  }, [submissions, userQuizzes]);

  // Create a Set of attempted exercise IDs from submissions (exclude quizzes)
  const attemptedExerciseIds = new Set(
    submissions.map(submission => submission.exerciseId).filter((id): id is string => !!id)
  );

  return (
    <>
      {/* Level Selector - Split Button Style */}
      <div className="mb-8">
        <CEFRLevelSelector
          selectedLevel={selectedLevel}
          onLevelChange={onLevelChange}
          colorScheme="default"
          showDescription={true}
          size="sm"
        />
      </div>

      {/* Stats - TabBar Style (like flashcard practice) */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading your stats...</p>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <TabBar
            variant="stats"
            tabs={[
              {
                id: 'exercises',
                label: 'Total Exercises',
                icon: undefined,
                value: (writingStats?.totalExercisesCompleted || 0) + (quizStats?.totalQuizzes || 0),
              },
              {
                id: 'score',
                label: 'Avg Writing Score',
                icon: undefined,
                value: `${writingStats?.averageOverallScore || 0}%`,
              },
              ...(quizStats && quizStats.totalQuizzes > 0 ? [{
                id: 'quiz-points',
                label: 'Quiz Points',
                icon: undefined,
                value: quizStats.totalPoints,
              }] : []),
              {
                id: 'streak',
                label: 'Day Streak',
                icon: undefined,
                value: writingStats?.currentStreak || 0,
              },
              {
                id: 'words',
                label: 'Words Written',
                icon: undefined,
                value: (writingStats?.totalWordsWritten || 0).toLocaleString(),
              },
            ]}
          />
        </div>
      )}

      {/* Exercise Types - TabBar Style */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Choose Exercise Type</h2>
        <TabBar
          variant="tabs"
          size="compact"
          activeTabId={selectedExerciseType || undefined}
          onTabChange={(tabId) => onExerciseTypeSelect(tabId as ExerciseType)}
          tabs={[
            {
              id: 'creative',
              label: 'Creative Writing',
              icon: null,
              value: filteredCreativeExercises.length,
            },
            {
              id: 'translation',
              label: 'Translation',
              icon: null,
              value: filteredTranslationExercises.length,
            },
            {
              id: 'email',
              label: 'Email Writing',
              icon: null,
              value: filteredEmailTemplates.length,
            },
            {
              id: 'letters',
              label: 'Letter Writing',
              icon: null,
              value: filteredLetterTemplates.length,
            },
          ]}
        />
      </div>

      {/* Show Exercise Selector Below When Type is Selected */}
      {selectedExerciseType === 'translation' && (
        <div className="mt-8">
          <TranslationExerciseSelector
            exercises={filteredTranslationExercises}
            onSelect={onTranslationSelect}
            attemptedExerciseIds={attemptedExerciseIds}
          />
        </div>
      )}

      {selectedExerciseType === 'creative' && (
        <div className="mt-8">
          <CreativeExerciseSelector
            exercises={filteredCreativeExercises}
            onSelect={onCreativeSelect}
            attemptedExerciseIds={attemptedExerciseIds}
          />
        </div>
      )}

      {selectedExerciseType === 'email' && (
        <div className="mt-8">
          <EmailTemplateSelector
            templates={filteredEmailTemplates}
            onSelect={onEmailSelect}
            attemptedExerciseIds={attemptedExerciseIds}
          />
        </div>
      )}

      {selectedExerciseType === 'letters' && (
        <div className="mt-8">
          <LetterTemplateSelector
            templates={filteredLetterTemplates}
            onSelect={onLetterSelect}
            attemptedExerciseIds={attemptedExerciseIds}
          />
        </div>
      )}

      {/* Recent Activity / History */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Recent Submissions</h2>
          {combinedSubmissions.length > 3 && (
            <button
              onClick={onToggleHistory}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {showHistory ? 'Show Less' : 'View All'}
            </button>
          )}
        </div>

        <WritingHistory
          submissions={showHistory ? combinedSubmissions : combinedSubmissions.slice(0, 3)}
          onViewSubmission={onViewSubmission}
          isLoading={submissionsLoading}
        />
      </div>

      {/* Writing Tips */}
      <div className="mt-8">
        <WritingTipsCard />
      </div>
    </>
  );
}
