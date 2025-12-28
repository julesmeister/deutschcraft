import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Export all data from Firestore
 * POST /api/database/export
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a teacher (only teachers can perform migrations)
    const userDoc = await adminDb.collection('users').doc(session.user.email).get();
    const userData = userDoc.data();

    if (userData?.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Only teachers can export data' },
        { status: 403 }
      );
    }

    console.log('[Export] Starting Firestore export...');

    // Export all collections
    const exportData: any = {
      exportedAt: Date.now(),
      exportedBy: session.user.email,
      version: '1.0',
      collections: {},
      stats: {},
    };

    // 1. Export users
    console.log('[Export] Exporting users...');
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.users = users;
    exportData.stats.users = users.length;

    // 2. Export batches
    console.log('[Export] Exporting batches...');
    const batchesSnapshot = await adminDb.collection('batches').get();
    const batches = batchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.batches = batches;
    exportData.stats.batches = batches.length;

    // 3. Export tasks
    console.log('[Export] Exporting tasks...');
    const tasksSnapshot = await adminDb.collection('tasks').get();
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.tasks = tasks;
    exportData.stats.tasks = tasks.length;

    // 4. Export submissions
    console.log('[Export] Exporting submissions...');
    const submissionsSnapshot = await adminDb.collection('submissions').get();
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.submissions = submissions;
    exportData.stats.submissions = submissions.length;

    // 5. Export progress
    console.log('[Export] Exporting progress...');
    const progressSnapshot = await adminDb.collection('progress').get();
    const progress = progressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.progress = progress;
    exportData.stats.progress = progress.length;

    // 6. Export vocabulary
    console.log('[Export] Exporting vocabulary...');
    const vocabularySnapshot = await adminDb.collection('vocabulary').get();
    const vocabulary = vocabularySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.vocabulary = vocabulary;
    exportData.stats.vocabulary = vocabulary.length;

    // 7. Export flashcards
    console.log('[Export] Exporting flashcards...');
    const flashcardsSnapshot = await adminDb.collection('flashcards').get();
    const flashcards = flashcardsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.flashcards = flashcards;
    exportData.stats.flashcards = flashcards.length;

    // 8. Export flashcard-progress
    console.log('[Export] Exporting flashcard-progress...');
    const flashcardProgressSnapshot = await adminDb.collection('flashcard-progress').get();
    const flashcardProgress = flashcardProgressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.flashcardProgress = flashcardProgress;
    exportData.stats.flashcardProgress = flashcardProgress.length;

    // 9. Export exercise-overrides
    console.log('[Export] Exporting exercise-overrides...');
    const overridesSnapshot = await adminDb.collection('exercise-overrides').get();
    const overrides = overridesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.exerciseOverrides = overrides;
    exportData.stats.exerciseOverrides = overrides.length;

    // 10. Export saved-vocabulary
    console.log('[Export] Exporting saved-vocabulary...');
    const savedVocabSnapshot = await adminDb.collection('saved-vocabulary').get();
    const savedVocab = savedVocabSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.savedVocabulary = savedVocab;
    exportData.stats.savedVocabulary = savedVocab.length;

    // 11. Export activities
    console.log('[Export] Exporting activities...');
    const activitiesSnapshot = await adminDb.collection('activities').get();
    const activities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.activities = activities;
    exportData.stats.activities = activities.length;

    // 12. Export grammar-rules
    console.log('[Export] Exporting grammar-rules...');
    const grammarRulesSnapshot = await adminDb.collection('grammar-rules').get();
    const grammarRules = grammarRulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.grammarRules = grammarRules;
    exportData.stats.grammarRules = grammarRules.length;

    // 13. Export grammar-sentences
    console.log('[Export] Exporting grammar-sentences...');
    const grammarSentencesSnapshot = await adminDb.collection('grammar-sentences').get();
    const grammarSentences = grammarSentencesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.grammarSentences = grammarSentences;
    exportData.stats.grammarSentences = grammarSentences.length;

    // 14. Export grammar-reviews
    console.log('[Export] Exporting grammar-reviews...');
    const grammarReviewsSnapshot = await adminDb.collection('grammar-reviews').get();
    const grammarReviews = grammarReviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    exportData.collections.grammarReviews = grammarReviews;
    exportData.stats.grammarReviews = grammarReviews.length;

    // Calculate total
    exportData.stats.total = Object.values(exportData.stats).reduce(
      (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
      0
    );

    console.log('[Export] Completed successfully:', exportData.stats);

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('[Export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
