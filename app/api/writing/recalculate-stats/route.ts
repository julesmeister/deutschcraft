/**
 * API Route: Recalculate Writing Stats
 * Manually trigger stats recalculation for a student
 *
 * This is useful for:
 * 1. Fixing stats that got out of sync
 * 2. Updating stats for existing graded submissions
 * 3. One-time data migration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { getStudentSubmissions } from '@/lib/services/writing/submissions-queries';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get userId from request body
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get all student submissions with teacher scores
    const submissions = await getStudentSubmissions(userId);
    const gradedSubmissions = submissions.filter(s => s.teacherScore !== undefined && s.teacherScore > 0);

    console.log(`[recalculate-stats] User ${userId}: Found ${submissions.length} submissions, ${gradedSubmissions.length} graded`);

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
    const averageGrammarScore = count > 0 ? Math.round(totalScores.grammar / count) : 0;
    const averageVocabularyScore = count > 0 ? Math.round(totalScores.vocabulary / count) : 0;
    const averageCoherenceScore = count > 0 ? Math.round(totalScores.coherence / count) : 0;
    const averageOverallScore = count > 0 ? Math.round(totalScores.overall / count) : 0;

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

    return NextResponse.json({
      success: true,
      stats: {
        totalExercisesCompleted: submissions.length,
        gradedExercises: count,
        totalTranslations,
        totalCreativeWritings,
        totalWordsWritten,
        averageGrammarScore,
        averageVocabularyScore,
        averageCoherenceScore,
        averageOverallScore,
      },
    });
  } catch (error) {
    console.error('[recalculate-stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
