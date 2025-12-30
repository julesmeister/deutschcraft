/**
 * Progress Service
 * Centralized service for fetching and aggregating student progress data
 */

import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

/**
 * Fetch progress documents for a user
 */
export async function fetchUserProgress(
  userId: string,
  limitCount: number = 30
): Promise<StudyProgress[]> {
  const progressRef = collection(db, 'progress');
  const q = query(
    progressRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as StudyProgress);
}

/**
 * Fetch progress for a specific date
 */
export async function fetchProgressForDate(
  userId: string,
  date: Date | string
): Promise<DailyProgress | null> {
  const dateStr = typeof date === 'string' ? date : formatDateISO(date);
  const progressId = `PROG_${dateStr.replace(/-/g, '')}_${userId}`;
  const progressRef = doc(db, 'progress', progressId);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    return null;
  }

  const data = progressSnap.data() as StudyProgress;
  return {
    date: dateStr,
    cardsReviewed: data.cardsReviewed || 0,
    wordsCorrect: data.wordsCorrect || 0,
    wordsIncorrect: data.wordsIncorrect || 0,
    timeSpent: data.timeSpent || 0,
    sessionsCompleted: data.sessionsCompleted || 0,
  };
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

  // Optimization: Check if the most recent activity is today or yesterday to keep streak alive
  // If the most recent activity is older than yesterday, streak is broken (0)
  if (sorted.length > 0) {
    const lastActivityDate = sorted[0].date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateISO(yesterday);
    
    if (lastActivityDate !== today && lastActivityDate !== yesterdayStr) {
      return 0;
    }
  }
  
  // Use a Set for O(1) lookups of study dates
  const studyDates = new Set(sorted.map(s => s.date));
  
  // Check consecutively backwards
  let currentCheckDate = new Date();
  let daysChecked = 0;
  
  // If today is not studied, but yesterday is, we start checking from yesterday
  if (!studyDates.has(formatDateISO(currentCheckDate))) {
    // Check if yesterday exists
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateISO(yesterday);
    
    if (studyDates.has(yesterdayStr)) {
      // Streak is alive, start counting from yesterday
      currentCheckDate = yesterday;
    } else {
      // No study today or yesterday -> streak broken
      return 0;
    }
  }

  while (true) {
    const dateStr = formatDateISO(currentCheckDate);
    if (studyDates.has(dateStr)) {
      streak++;
      // Move to previous day
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
      daysChecked++;
      
      // Safety break to prevent infinite loops
      if (daysChecked > 3650) break; 
    } else {
      break;
    }
  }

  return streak;
}
