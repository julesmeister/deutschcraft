import { db } from '@/turso/client';
import { WritingStats } from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import { formatDateISO } from '@/lib/utils/dateHelpers';

export async function recalculateWritingStatsAdmin(userId: string): Promise<WritingStats> {
  try {
    // 1. Fetch all valid submissions
    const result = await db.execute({
      sql: `SELECT 
              exercise_type, 
              level, 
              word_count, 
              submitted_at, 
              teacher_score, 
              ai_feedback
            FROM writing_submissions 
            WHERE user_id = ? 
              AND status IN ('submitted', 'reviewed')
            ORDER BY submitted_at DESC`,
      args: [userId],
    });

    const submissions = result.rows;

    // 2. Calculate Stats
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
    const dates = new Set<string>();

    for (const sub of submissions) {
      totalExercises++;
      totalWords += Number(sub.word_count) || 0;
      
      const type = sub.exercise_type as string;
      if (type === 'translation') {
        totalTranslations++;
      } else {
        totalCreative++;
      }

      const level = sub.level as string;
      if (level) {
        exercisesByLevel[level] = (exercisesByLevel[level] || 0) + 1;
      }

      // Scores
      let score = Number(sub.teacher_score);
      let aiFeedback: any = null;
      
      if (!score && sub.ai_feedback) {
        try {
          aiFeedback = JSON.parse(sub.ai_feedback as string);
          score = aiFeedback.overallScore;
        } catch (e) {}
      }

      if (score > 0) {
        gradedCount++;
        overallSum += score;
        
        // Try to get sub-scores from AI feedback if available, otherwise use overall
        // Note: DB schema might not have separate columns for sub-scores, so we parse JSON
        if (!aiFeedback && sub.ai_feedback) {
           try {
            aiFeedback = JSON.parse(sub.ai_feedback as string);
          } catch (e) {}
        }

        grammarSum += aiFeedback?.grammarScore || score;
        vocabSum += aiFeedback?.vocabularyScore || score;
        coherenceSum += aiFeedback?.coherenceScore || score;

        // Recent scores (already sorted desc)
        if (recentScores.length < 10) {
          recentScores.push(score);
        }
      }

      // Dates for streaks
      if (sub.submitted_at) {
        dates.add(formatDateISO(new Date(Number(sub.submitted_at))));
      }
    }

    // 3. Calculate Streaks (Reuse logic)
    const sortedDates = Array.from(dates).sort().reverse();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
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

    // 4. Update Database
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

    await db.execute({
      sql: `INSERT INTO writing_stats (
              user_id, 
              total_exercises_completed, 
              total_translations, 
              total_creative_writings, 
              total_words_written, 
              total_time_spent, 
              average_grammar_score, 
              average_vocabulary_score, 
              average_coherence_score, 
              average_overall_score, 
              exercises_by_level, 
              current_streak, 
              longest_streak, 
              last_practice_date, 
              recent_scores, 
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              total_exercises_completed = excluded.total_exercises_completed,
              total_translations = excluded.total_translations,
              total_creative_writings = excluded.total_creative_writings,
              total_words_written = excluded.total_words_written,
              total_time_spent = excluded.total_time_spent,
              average_grammar_score = excluded.average_grammar_score,
              average_vocabulary_score = excluded.average_vocabulary_score,
              average_coherence_score = excluded.average_coherence_score,
              average_overall_score = excluded.average_overall_score,
              exercises_by_level = excluded.exercises_by_level,
              current_streak = excluded.current_streak,
              longest_streak = excluded.longest_streak,
              last_practice_date = excluded.last_practice_date,
              recent_scores = excluded.recent_scores,
              updated_at = excluded.updated_at`,
      args: [
        userId,
        stats.totalExercisesCompleted,
        stats.totalTranslations,
        stats.totalCreativeWritings,
        stats.totalWordsWritten,
        stats.totalTimeSpent,
        stats.averageGrammarScore,
        stats.averageVocabularyScore,
        stats.averageCoherenceScore,
        stats.averageOverallScore,
        JSON.stringify(stats.exercisesByLevel),
        stats.currentStreak,
        stats.longestStreak,
        stats.lastPracticeDate || null,
        JSON.stringify(stats.recentScores),
        stats.updatedAt,
      ],
    });

    return stats;
  } catch (error) {
    console.error('[writingService:turso] Error recalculating stats:', error);
    throw error;
  }
}
