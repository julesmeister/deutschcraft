/**
 * Answer Hub Models
 * Aggregated view of student exercise activity
 */

import { CEFRLevel } from './cefr';

export interface AnswerHubStats {
  totalAnswersSubmitted: number;
  activityStreak: number;
  exercisesAttempted: number;
  lastActivityAt: number;
}

export interface ExerciseActivitySummary {
  exerciseId: string;
  exerciseTitle: string;
  level: CEFRLevel;
  bookType: 'AB' | 'KB';
  lessonNumber: number;
  itemsSubmitted: number;
  totalItems: number;
  completionPercentage: number;
  status: 'new' | 'in_progress' | 'completed';
  lastActivityAt: number;
  firstActivityAt: number;
}

/**
 * Helper: Calculate activity streak from timestamps
 * @param timestamps - Array of submission timestamps
 * @returns Number of consecutive days with activity
 */
export function calculateStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;

  // Group by date (ignore time)
  const uniqueDates = Array.from(
    new Set(
      timestamps.map(ts =>
        new Date(ts).toDateString()
      )
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  // Check if most recent activity is today or yesterday
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0; // Streak is broken
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i - 1]);
    const prevDate = new Date(uniqueDates[i]);
    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / 86400000
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
