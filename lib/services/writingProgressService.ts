/**
 * Writing Progress Service
 * Centralized service for tracking and calculating writing progress
 */

import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WritingProgress, WritingStats, WritingSubmission } from '@/lib/models/writing';
import { formatDateISO } from '@/lib/utils/dateHelpers';
import { CEFRLevel } from '@/lib/models/cefr';

/**
 * Fetch writing progress for a user
 */
export async function fetchUserWritingProgress(
  userId: string,
  limitCount: number = 30
): Promise<WritingProgress[]> {
  const progressRef = collection(db, 'writing-progress');
  const q = query(
    progressRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as WritingProgress);
}

/**
 * Get today's writing progress
 */
export async function getTodayWritingProgress(userId: string): Promise<WritingProgress> {
  const today = formatDateISO(new Date());
  const progressId = `WPROG_${today.replace(/-/g, '')}_${userId}`;
  const progressRef = doc(db, 'writing-progress', progressId);
  const progressSnap = await getDoc(progressRef);

  if (!progressSnap.exists()) {
    // Return default empty progress
    return {
      progressId,
      userId,
      date: today,
      exercisesCompleted: 0,
      translationsCompleted: 0,
      creativeWritingsCompleted: 0,
      totalWordsWritten: 0,
      timeSpent: 0,
      averageGrammarScore: 0,
      averageVocabularyScore: 0,
      averageOverallScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  return progressSnap.data() as WritingProgress;
}

/**
 * Update daily writing progress after completing an exercise
 */
export async function updateDailyProgress(
  userId: string,
  submission: WritingSubmission
): Promise<void> {
  const today = formatDateISO(new Date());
  const progressId = `WPROG_${today.replace(/-/g, '')}_${userId}`;
  const progressRef = doc(db, 'writing-progress', progressId);

  // Get current progress or create new
  const progressSnap = await getDoc(progressRef);
  const currentProgress: WritingProgress = progressSnap.exists()
    ? (progressSnap.data() as WritingProgress)
    : {
        progressId,
        userId,
        date: today,
        exercisesCompleted: 0,
        translationsCompleted: 0,
        creativeWritingsCompleted: 0,
        totalWordsWritten: 0,
        timeSpent: 0,
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageOverallScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

  // Calculate new values
  const newExercisesCompleted = currentProgress.exercisesCompleted + 1;
  const isTranslation = submission.exerciseType === 'translation';

  // Calculate new averages (using AI or teacher scores if available, otherwise leave at 0)
  // NOTE: Scores are only updated when teacher reviews the submission
  const totalScores = currentProgress.exercisesCompleted;
  const newGrammarScore = submission.aiFeedback?.grammarScore || 0;
  const newVocabScore = submission.aiFeedback?.vocabularyScore || 0;
  const newOverallScore = submission.teacherScore || submission.aiFeedback?.overallScore || 0;

  // Only update averages if we have a score (teacher has reviewed)
  const averageGrammarScore =
    newGrammarScore > 0
      ? totalScores === 0
        ? newGrammarScore
        : (currentProgress.averageGrammarScore * totalScores + newGrammarScore) / newExercisesCompleted
      : currentProgress.averageGrammarScore;

  const averageVocabularyScore =
    newVocabScore > 0
      ? totalScores === 0
        ? newVocabScore
        : (currentProgress.averageVocabularyScore * totalScores + newVocabScore) / newExercisesCompleted
      : currentProgress.averageVocabularyScore;

  const averageOverallScore =
    newOverallScore > 0
      ? totalScores === 0
        ? newOverallScore
        : (currentProgress.averageOverallScore * totalScores + newOverallScore) / newExercisesCompleted
      : currentProgress.averageOverallScore;

  // Update progress
  const updatedProgress: WritingProgress = {
    ...currentProgress,
    exercisesCompleted: newExercisesCompleted,
    translationsCompleted: currentProgress.translationsCompleted + (isTranslation ? 1 : 0),
    creativeWritingsCompleted: currentProgress.creativeWritingsCompleted + (isTranslation ? 0 : 1),
    totalWordsWritten: currentProgress.totalWordsWritten + submission.wordCount,
    averageGrammarScore: Math.round(averageGrammarScore),
    averageVocabularyScore: Math.round(averageVocabularyScore),
    averageOverallScore: Math.round(averageOverallScore),
    updatedAt: Date.now(),
  };

  await setDoc(progressRef, updatedProgress);
}

/**
 * Calculate writing streak from progress documents
 */
export async function calculateWritingStreak(userId: string): Promise<{ current: number; longest: number }> {
  const progressDocs = await fetchUserWritingProgress(userId, 365);

  if (progressDocs.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort by date descending
  const sorted = [...progressDocs].sort((a, b) => b.date.localeCompare(a.date));

  // Calculate current streak
  let currentStreak = 0;
  const today = formatDateISO(new Date());

  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = formatDateISO(expectedDate);

    const doc = sorted.find(d => d.date === expectedDateStr);
    if (doc && doc.exercisesCompleted > 0) {
      currentStreak++;
    } else if (i > 0) {
      // If not today and we didn't find it, break
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const doc of sorted.reverse()) {
    if (doc.exercisesCompleted === 0) continue;

    const currentDate = new Date(doc.date);

    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    lastDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Update overall writing statistics
 */
export async function updateWritingStats(
  userId: string,
  submission: WritingSubmission
): Promise<void> {
  const statsRef = doc(db, 'writing-stats', userId);
  const statsSnap = await getDoc(statsRef);

  const currentStats: WritingStats = statsSnap.exists()
    ? (statsSnap.data() as WritingStats)
    : {
        userId,
        totalExercisesCompleted: 0,
        totalTranslations: 0,
        totalCreativeWritings: 0,
        totalWordsWritten: 0,
        totalTimeSpent: 0,
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageCoherenceScore: 0,
        averageOverallScore: 0,
        exercisesByLevel: {} as Record<CEFRLevel, number>,
        currentStreak: 0,
        longestStreak: 0,
        recentScores: [],
        updatedAt: Date.now(),
      };

  // Calculate streaks
  const streaks = await calculateWritingStreak(userId);

  // Update exercise count by level
  const exercisesByLevel = { ...currentStats.exercisesByLevel };
  exercisesByLevel[submission.level] = (exercisesByLevel[submission.level] || 0) + 1;

  // Update recent scores (keep last 10) - only from teacher reviews
  const recentScores = [...currentStats.recentScores];
  if (submission.teacherScore && submission.teacherScore > 0) {
    recentScores.unshift(submission.teacherScore);
    if (recentScores.length > 10) {
      recentScores.pop();
    }
  }

  // Calculate new averages (using AI or teacher scores if available)
  // NOTE: Scores are only updated when teacher reviews the submission
  const total = currentStats.totalExercisesCompleted;
  const newGrammar = submission.aiFeedback?.grammarScore || 0;
  const newVocab = submission.aiFeedback?.vocabularyScore || 0;
  const newCoherence = submission.aiFeedback?.coherenceScore || 0;
  const newOverall = submission.teacherScore || submission.aiFeedback?.overallScore || 0;

  // Only update averages if we have a score (teacher has reviewed)
  const averageGrammarScore =
    newGrammar > 0
      ? total === 0
        ? newGrammar
        : (currentStats.averageGrammarScore * total + newGrammar) / (total + 1)
      : currentStats.averageGrammarScore;

  const averageVocabularyScore =
    newVocab > 0
      ? total === 0
        ? newVocab
        : (currentStats.averageVocabularyScore * total + newVocab) / (total + 1)
      : currentStats.averageVocabularyScore;

  const averageCoherenceScore =
    newCoherence > 0
      ? total === 0
        ? newCoherence
        : (currentStats.averageCoherenceScore * total + newCoherence) / (total + 1)
      : currentStats.averageCoherenceScore;

  const averageOverallScore =
    newOverall > 0
      ? total === 0
        ? newOverall
        : (currentStats.averageOverallScore * total + newOverall) / (total + 1)
      : currentStats.averageOverallScore;

  // Update stats
  const updatedStats: WritingStats = {
    ...currentStats,
    totalExercisesCompleted: total + 1,
    totalTranslations:
      currentStats.totalTranslations + (submission.exerciseType === 'translation' ? 1 : 0),
    totalCreativeWritings:
      currentStats.totalCreativeWritings + (submission.exerciseType !== 'translation' ? 1 : 0),
    totalWordsWritten: currentStats.totalWordsWritten + submission.wordCount,
    averageGrammarScore: Math.round(averageGrammarScore),
    averageVocabularyScore: Math.round(averageVocabularyScore),
    averageCoherenceScore: Math.round(averageCoherenceScore),
    averageOverallScore: Math.round(averageOverallScore),
    exercisesByLevel,
    currentStreak: streaks.current,
    longestStreak: Math.max(streaks.longest, currentStats.longestStreak),
    lastPracticeDate: formatDateISO(new Date()),
    recentScores,
    updatedAt: Date.now(),
  };

  await setDoc(statsRef, updatedStats);
}

/**
 * Get aggregate statistics for all students (teacher view)
 */
export async function getTeacherWritingStats(teacherId: string): Promise<{
  totalSubmissions: number;
  averageScore: number;
  totalWordsWritten: number;
  submissionsThisWeek: number;
}> {
  // This would need to query submissions and aggregate
  // For now, return mock data
  return {
    totalSubmissions: 0,
    averageScore: 0,
    totalWordsWritten: 0,
    submissionsThisWeek: 0,
  };
}
