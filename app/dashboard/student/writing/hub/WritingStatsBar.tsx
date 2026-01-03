import { TabBar } from "@/components/ui/TabBar";

interface WritingStatsBarProps {
  writingStats?: {
    totalExercisesCompleted: number;
    averageOverallScore: number;
    currentStreak: number;
    totalWordsWritten: number;
  };
  quizStats?: {
    totalQuizzes: number;
    totalPoints: number;
  };
  isLoading: boolean;
}

export function WritingStatsBar({ writingStats, quizStats, isLoading }: WritingStatsBarProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <TabBar
        variant="stats"
        tabs={[
          {
            id: "exercises",
            label: "Total Exercises",
            icon: undefined,
            value:
              (writingStats?.totalExercisesCompleted || 0) +
              (quizStats?.totalQuizzes || 0),
          },
          {
            id: "score",
            label: "Avg Writing Score",
            icon: undefined,
            value: `${writingStats?.averageOverallScore || 0}%`,
          },
          ...(quizStats && quizStats.totalQuizzes > 0
            ? [
                {
                  id: "quiz-points",
                  label: "Quiz Points",
                  icon: undefined,
                  value: quizStats.totalPoints,
                },
              ]
            : []),
          {
            id: "streak",
            label: "Day Streak",
            icon: undefined,
            value: writingStats?.currentStreak || 0,
          },
          {
            id: "words",
            label: "Words Written",
            icon: undefined,
            value: (writingStats?.totalWordsWritten || 0).toLocaleString(),
          },
        ]}
      />
    </div>
  );
}
