/**
 * Writing Stats Calculator (Admin SDK)
 * Server-side stats recalculation using Firebase Admin SDK
 *
 * Used by API routes to bypass Firestore security rules
 */

import { adminDb } from '../../firebase-admin';

/**
 * Recalculate and update student's writing stats based on all their graded submissions
 * Server-side version using Admin SDK
 * @param userId - Student's user ID (email)
 */
export async function recalculateWritingStatsAdmin(userId: string): Promise<{
  totalExercisesCompleted: number;
  gradedExercises: number;
  totalTranslations: number;
  totalCreativeWritings: number;
  totalWordsWritten: number;
  averageGrammarScore: number;
  averageVocabularyScore: number;
  averageCoherenceScore: number;
  averageOverallScore: number;
}> {
  try {
    // Get all student submissions using Admin SDK
    const submissionsSnapshot = await adminDb
      .collection('writing-submissions')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    const submissions = submissionsSnapshot.docs.map(doc => ({
      submissionId: doc.id,
      ...doc.data(),
    })) as any[];

    const gradedSubmissions = submissions.filter(s => s.teacherScore !== undefined && s.teacherScore > 0);

    if (gradedSubmissions.length === 0) {
      // No graded submissions, return zeros
      const emptyStats = {
        totalExercisesCompleted: submissions.length,
        gradedExercises: 0,
        totalTranslations: submissions.filter(s => s.exerciseType === 'translation').length,
        totalCreativeWritings: submissions.filter(s => s.exerciseType === 'creative').length,
        totalWordsWritten: submissions.reduce((acc, sub) => {
          const wordCount = sub.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0;
          return acc + wordCount;
        }, 0),
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageCoherenceScore: 0,
        averageOverallScore: 0,
      };

      // Update stats in Firestore
      await adminDb.collection('writing-stats').doc(userId).set({
        userId,
        ...emptyStats,
        updatedAt: Date.now(),
      }, { merge: true });

      return emptyStats;
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
      const wordCount = sub.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0;
      return acc + wordCount;
    }, 0);

    const stats = {
      totalExercisesCompleted: submissions.length,
      gradedExercises: count,
      totalTranslations,
      totalCreativeWritings,
      totalWordsWritten,
      averageGrammarScore,
      averageVocabularyScore,
      averageCoherenceScore,
      averageOverallScore,
    };

    // Update stats in Firestore using Admin SDK
    await adminDb.collection('writing-stats').doc(userId).set({
      userId,
      ...stats,
      updatedAt: Date.now(),
    }, { merge: true });

    console.log(`[stats-calculator.admin] Updated writing stats for user ${userId}:`, {
      totalExercisesCompleted: submissions.length,
      gradedCount: count,
      averageOverallScore,
    });

    return stats;
  } catch (error) {
    console.error('[stats-calculator.admin] Error recalculating writing stats:', error);
    throw error;
  }
}
