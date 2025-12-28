import { WritingSubmission, WritingStats } from "../../../models/writing";

export function calculateWritingStats(
  submissions: WritingSubmission[],
  currentStats?: WritingStats
): Partial<WritingStats> {
  // Simplified calculation
  const totalExercises = submissions.length;
  const totalWords = submissions.reduce(
    (sum, s) => sum + (s.wordCount || 0),
    0
  );

  // Logic to calculate averages, streaks etc would go here
  // For now returning basic stats
  return {
    totalExercisesCompleted: totalExercises,
    totalWordsWritten: totalWords,
    updatedAt: Date.now(),
  };
}
