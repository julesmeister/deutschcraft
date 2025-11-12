/**
 * Progress Service - Turso Implementation
 * Centralized service for fetching and aggregating student progress data
 */

import { db } from '@/turso/client';
import { StudyProgress } from '@/lib/models';
import { formatDateISO, getLastNDaysISO } from '@/lib/utils/dateHelpers';

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  cardsReviewed: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  timeSpent: number;
  sessionsCompleted: number;
}

export interface WeeklyProgressData {
  dailyData: number[];
  dayLabels: string[];
  totalCards: number;
  dates: string[]; // ISO date strings for each day
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to StudyProgress object
 */
function rowToProgress(row: any): StudyProgress {
  return {
    progressId: row.progress_id as string,
    userId: row.user_id as string,
    date: row.date as string,
    wordsStudied: Number(row.words_studied) || 0,
    wordsCorrect: Number(row.words_correct),
    wordsIncorrect: Number(row.words_incorrect),
    timeSpent: Number(row.time_spent),
    sessionsCompleted: Number(row.sessions_completed),
    cardsReviewed: Number(row.cards_reviewed),
    sentencesCreated: Number(row.sentences_created) || 0,
    createdAt: Number(row.created_at),
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Fetch progress documents for a user
 */
export async function fetchUserProgress(
  userId: string,
  limitCount: number = 30
): Promise<StudyProgress[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      args: [userId, limitCount],
    });

    return result.rows.map(rowToProgress);
  } catch (error) {
    console.error('[progressService:turso] Error fetching user progress:', error);
    throw error;
  }
}

/**
 * Fetch progress for a specific date
 */
export async function fetchProgressForDate(
  userId: string,
  date: Date | string
): Promise<DailyProgress | null> {
  try {
    const dateStr = typeof date === 'string' ? date : formatDateISO(date);

    const result = await db.execute({
      sql: 'SELECT * FROM progress WHERE user_id = ? AND date = ? LIMIT 1',
      args: [userId, dateStr],
    });

    if (result.rows.length === 0) return null;

    const data = rowToProgress(result.rows[0]);
    return {
      date: dateStr,
      cardsReviewed: data.cardsReviewed || 0,
      wordsCorrect: data.wordsCorrect || 0,
      wordsIncorrect: data.wordsIncorrect || 0,
      timeSpent: data.timeSpent || 0,
      sessionsCompleted: data.sessionsCompleted || 0,
    };
  } catch (error) {
    console.error('[progressService:turso] Error fetching progress for date:', error);
    throw error;
  }
}

/**
 * Aggregate progress by date from progress documents
 */
export function aggregateProgressByDate(
  progressDocs: StudyProgress[]
): Map<string, DailyProgress> {
  const progressMap = new Map<string, DailyProgress>();

  progressDocs.forEach((doc) => {
    const dateStr = doc.date;
    if (!dateStr) return;

    const existing = progressMap.get(dateStr);
    if (existing) {
      // Aggregate multiple sessions on the same day
      existing.cardsReviewed += doc.cardsReviewed || 0;
      existing.wordsCorrect += doc.wordsCorrect || 0;
      existing.wordsIncorrect += doc.wordsIncorrect || 0;
      existing.timeSpent += doc.timeSpent || 0;
      existing.sessionsCompleted += doc.sessionsCompleted || 0;
    } else {
      progressMap.set(dateStr, {
        date: dateStr,
        cardsReviewed: doc.cardsReviewed || 0,
        wordsCorrect: doc.wordsCorrect || 0,
        wordsIncorrect: doc.wordsIncorrect || 0,
        timeSpent: doc.timeSpent || 0,
        sessionsCompleted: doc.sessionsCompleted || 0,
      });
    }
  });

  return progressMap;
}

/**
 * Get weekly progress data (last 7 days)
 */
export async function getWeeklyProgress(userId: string): Promise<WeeklyProgressData> {
  try {
    // Fetch recent progress
    const progressDocs = await fetchUserProgress(userId, 30);

    // Aggregate by date
    const progressMap = aggregateProgressByDate(progressDocs);

    // Get last 7 days
    const last7Days = getLastNDaysISO(7);
    const dayLabels = last7Days.map(dateStr => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Build daily data array
    const dailyData = last7Days.map(dateStr => {
      const progress = progressMap.get(dateStr);
      return progress ? progress.cardsReviewed : 0;
    });

    // Calculate total
    const totalCards = dailyData.reduce((sum, count) => sum + count, 0);

    return {
      dailyData,
      dayLabels,
      totalCards,
      dates: last7Days,
    };
  } catch (error) {
    console.error('[progressService:turso] Error fetching weekly progress:', error);
    throw error;
  }
}

/**
 * Calculate accuracy percentage from progress data
 */
export function calculateAccuracy(progress: DailyProgress): number {
  const total = progress.wordsCorrect + progress.wordsIncorrect;
  if (total === 0) return 0;
  return Math.round((progress.wordsCorrect / total) * 100);
}

/**
 * Get today's progress
 */
export async function getTodayProgress(userId: string): Promise<DailyProgress> {
  try {
    const today = formatDateISO(new Date());
    const progress = await fetchProgressForDate(userId, today);

    return progress || {
      date: today,
      cardsReviewed: 0,
      wordsCorrect: 0,
      wordsIncorrect: 0,
      timeSpent: 0,
      sessionsCompleted: 0,
    };
  } catch (error) {
    console.error('[progressService:turso] Error fetching today progress:', error);
    throw error;
  }
}

/**
 * Calculate study streak from progress documents
 */
export function calculateStreak(progressDocs: StudyProgress[]): number {
  if (progressDocs.length === 0) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...progressDocs].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  let streak = 0;
  const today = formatDateISO(new Date());

  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = formatDateISO(expectedDate);

    if (sorted[i].date === expectedDateStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
