/**
 * Writing Stats Calculator
 * Helper functions for recalculating student writing statistics
 */

import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getStudentSubmissions } from './submissions-queries';

/**
 * Recalculate and update student's writing stats based on all their graded submissions
 * @param userId - Student's user ID
 */
export async function recalculateWritingStats(userId: string): Promise<void> {
  try {
    // Get all student submissions with teacher scores
    const submissions = await getStudentSubmissions(userId);
    const gradedSubmissions = submissions.filter(s => s.teacherScore !== undefined && s.teacherScore > 0);

    if (gradedSubmissions.length === 0) {
      // No graded submissions, keep stats at 0
      return;
    }

    // Calculate average scores
    const totalScores = gradedSubmissions.reduce((acc, sub) => {
      const feedback = sub.teacherFeedback;
      return {
        grammar: acc.grammar + (feedback?.grammarScore || 0),
        vocabulary: acc.vocabulary + (feedback?.vocabularyScore || 0),
        coherence: acc.coherence + (feedback?.coherenceScore || 0),
        overall: acc.overall + (sub.teacherScore || 0),
      };
    }, { grammar: 0, vocabulary: 0, coherence: 0, overall: 0 });

    const count = gradedSubmissions.length;
    const averageGrammarScore = Math.round(totalScores.grammar / count);
    const averageVocabularyScore = Math.round(totalScores.vocabulary / count);
    const averageCoherenceScore = Math.round(totalScores.coherence / count);
    const averageOverallScore = Math.round(totalScores.overall / count);

    // Count exercises by type
    const totalTranslations = submissions.filter(s => s.exerciseType === 'translation').length;
    const totalCreativeWritings = submissions.filter(s => s.exerciseType === 'creative').length;

    // Calculate total words written
    const totalWordsWritten = submissions.reduce((acc, sub) => {
      const wordCount = sub.content?.split(/\s+/).filter(w => w.length > 0).length || 0;
      return acc + wordCount;
    }, 0);

    // Update stats in Firestore
    const statsRef = doc(db, 'writing-stats', userId);
    await setDoc(statsRef, {
      userId,
      totalExercisesCompleted: submissions.length,
      totalTranslations,
      totalCreativeWritings,
      totalWordsWritten,
      averageGrammarScore,
      averageVocabularyScore,
      averageCoherenceScore,
      averageOverallScore,
      updatedAt: Date.now(),
    }, { merge: true });

    console.log(`[stats-calculator] Updated writing stats for user ${userId}:`, {
      totalExercisesCompleted: submissions.length,
      gradedCount: count,
      averageOverallScore,
    });
  } catch (error) {
    console.error('[stats-calculator] Error recalculating writing stats:', error);
    // Don't throw - stats update failure shouldn't break review submission
  }
}
