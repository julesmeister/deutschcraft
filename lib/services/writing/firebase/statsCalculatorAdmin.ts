import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { WritingStats, WritingSubmission } from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import { formatDateISO } from '@/lib/utils/dateHelpers';

export async function recalculateWritingStatsAdmin(userId: string): Promise<WritingStats> {
  // 1. Fetch all submissions
  const submissionsRef = collection(db, 'writing-submissions');
  const q = query(submissionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  const submissions = snapshot.docs.map(doc => ({
    ...doc.data(),
    submissionId: doc.id
  })) as WritingSubmission[];

  // 2. Filter for valid submissions (submitted or reviewed)
  const validSubmissions = submissions.filter(s => 
    s.status === 'submitted' || s.status === 'reviewed'
  );

  // 3. Calculate stats
  let totalWords = 0;
  let totalTime = 0;
  let totalExercises = 0;
  let totalTranslations = 0;
  let totalCreative = 0;
  
  let grammarSum = 0;
  let vocabSum = 0;
  let coherenceSum = 0;
  let overallSum = 0;
  let gradedCount = 0;
  
  const exercisesByLevel: Record<string, number> = {};
  const recentScores: number[] = [];
  
  // Sort by date for streak calculation and recent scores
  validSubmissions.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

  for (const sub of validSubmissions) {
    totalExercises++;
    totalWords += sub.wordCount || 0;
    // timeSpent is not always tracked on submission, but we can try
    // Assuming standard 15 mins if not present is probably wrong, so let's skip for now
    
    if (sub.exerciseType === 'translation') {
      totalTranslations++;
    } else {
      totalCreative++;
    }

    if (sub.level) {
      exercisesByLevel[sub.level] = (exercisesByLevel[sub.level] || 0) + 1;
    }

    // Scores (only if teacher scored or AI scored)
    // Prefer teacher score
    const score = sub.teacherScore || sub.aiFeedback?.overallScore;
    if (score) {
      gradedCount++;
      overallSum += score;
      grammarSum += sub.aiFeedback?.grammarScore || score; // Fallback
      vocabSum += sub.aiFeedback?.vocabularyScore || score;
      coherenceSum += sub.aiFeedback?.coherenceScore || score;
      
      // Add to recent scores (since we sorted desc, we push to end)
      if (recentScores.length < 10) {
        recentScores.push(score);
      }
    }
  }

  // 4. Calculate Streaks
  // This requires looking at dates. A simple implementation:
  const dates = new Set<string>();
  validSubmissions.forEach(s => {
    if (s.submittedAt) {
      dates.add(formatDateISO(new Date(s.submittedAt)));
    }
  });
  
  const sortedDates = Array.from(dates).sort().reverse(); // Newest first
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  
  // Current streak
  const today = formatDateISO(new Date());
  const yesterday = formatDateISO(new Date(Date.now() - 86400000));
  
  if (dates.has(today)) {
    currentStreak = 1;
    let checkDate = new Date(Date.now() - 86400000);
    while (dates.has(formatDateISO(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (dates.has(yesterday)) {
    currentStreak = 1;
    let checkDate = new Date(Date.now() - 86400000 * 2);
    while (dates.has(formatDateISO(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Longest streak
  // Helper to check consecutive days
  const dayInMillis = 24 * 60 * 60 * 1000;
  if (sortedDates.length > 0) {
    tempStreak = 1;
    longestStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const d1 = new Date(sortedDates[i]);
      const d2 = new Date(sortedDates[i+1]);
      const diff = (d1.getTime() - d2.getTime()) / dayInMillis;
      
      if (Math.round(diff) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
  }

  const stats: WritingStats = {
    userId,
    totalExercisesCompleted: totalExercises,
    totalTranslations,
    totalCreativeWritings: totalCreative,
    totalWordsWritten: totalWords,
    totalTimeSpent: totalTime,
    averageGrammarScore: gradedCount > 0 ? Math.round(grammarSum / gradedCount) : 0,
    averageVocabularyScore: gradedCount > 0 ? Math.round(vocabSum / gradedCount) : 0,
    averageCoherenceScore: gradedCount > 0 ? Math.round(coherenceSum / gradedCount) : 0,
    averageOverallScore: gradedCount > 0 ? Math.round(overallSum / gradedCount) : 0,
    exercisesByLevel: exercisesByLevel as Record<CEFRLevel, number>,
    currentStreak,
    longestStreak,
    recentScores,
    lastPracticeDate: sortedDates[0] || undefined,
    updatedAt: Date.now(),
  };

  // 5. Save
  await setDoc(doc(db, 'writing-stats', userId), stats);

  return stats;
}
