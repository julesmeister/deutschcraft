import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/turso/client';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  migrateUsersBatch,
  validateMigration,
  createBackup,
  estimateMigrationTime,
  checkMigrationSafety,
  getTursoStats,
  MigrationError,
  MigrationProgress,
} from '@/lib/services/database/migrationService';

/**
 * Enhanced migration endpoint with validation, batching, and error tracking
 * POST /api/database/migrate-enhanced
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a teacher
    const userDoc = await adminDb.collection('users').doc(session.user.email).get();
    const userData = userDoc.data();

    if (userData?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can migrate data' }, { status: 403 });
    }

    // Parse options
    const body = await request.json().catch(() => ({}));
    const options = {
      batchSize: body.batchSize || 100,
      validateAfter: body.validateAfter !== false,
      dryRun: body.dryRun === true,
    };

    console.log('[Enhanced Migration] Starting with options:', options);

    // Step 1: Safety check
    console.log('[Enhanced Migration] Step 1: Safety check...');
    const safetyCheck = await checkMigrationSafety();
    if (!safetyCheck.safe) {
      return NextResponse.json(
        {
          error: 'Migration safety check failed',
          issues: safetyCheck.issues,
        },
        { status: 400 }
      );
    }

    // Step 2: Get Firestore data
    console.log('[Enhanced Migration] Step 2: Fetching Firestore data...');
    const usersSnapshot = await adminDb.collection('users').get();
    const batchesSnapshot = await adminDb.collection('batches').get();
    const vocabularySnapshot = await adminDb.collection('vocabulary').get();
    const flashcardProgressSnapshot = await adminDb.collection('flashcard-progress').get();

    const firestoreData = {
      users: usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      batches: batchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      vocabulary: vocabularySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      flashcardProgress: flashcardProgressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    };

    const stats = {
      users: firestoreData.users.length,
      batches: firestoreData.batches.length,
      vocabulary: firestoreData.vocabulary.length,
      flashcardProgress: firestoreData.flashcardProgress.length,
    };

    // Step 3: Estimate time
    console.log('[Enhanced Migration] Step 3: Estimating migration time...');
    const estimate = estimateMigrationTime(stats);
    console.log(
      `[Enhanced Migration] Estimated time: ${estimate.estimatedMinutes} minutes for ${stats.users + stats.batches + stats.vocabulary + stats.flashcardProgress} records`
    );

    if (estimate.warning) {
      console.warn(`[Enhanced Migration] Warning: ${estimate.warning}`);
    }

    // Step 4: Create backup (if not dry run)
    let backupData = null;
    if (!options.dryRun) {
      console.log('[Enhanced Migration] Step 4: Creating backup...');
      backupData = await createBackup(['users', 'batches', 'vocabulary', 'flashcard_progress']);
    }

    const allErrors: MigrationError[] = [];

    // Step 5: Migrate users (in dependency order)
    console.log('[Enhanced Migration] Step 5: Migrating users...');
    const usersResult = await migrateUsersBatch(firestoreData.users, {
      batchSize: options.batchSize,
      dryRun: options.dryRun,
    });
    allErrors.push(...usersResult.errors);

    // Step 6: Migrate batches
    console.log('[Enhanced Migration] Step 6: Migrating batches...');
    let batchesSuccess = 0;
    if (!options.dryRun) {
      for (const batch of firestoreData.batches) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO batches (
              batch_id, teacher_id, name, description, current_level,
              is_active, start_date, end_date, student_count,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              batch.batchId || batch.id,
              batch.teacherId || batch.teacher_id,
              batch.name,
              batch.description || null,
              batch.currentLevel || batch.current_level,
              batch.isActive ?? batch.is_active ?? true,
              batch.startDate || batch.start_date,
              batch.endDate || batch.end_date || null,
              batch.studentCount || batch.student_count || 0,
              batch.createdAt || batch.created_at || Date.now(),
              batch.updatedAt || batch.updated_at || Date.now(),
            ],
          });
          batchesSuccess++;
        } catch (error) {
          allErrors.push({
            collection: 'batches',
            recordId: batch.batchId || batch.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } else {
      batchesSuccess = firestoreData.batches.length;
    }

    // Step 7: Migrate vocabulary
    console.log('[Enhanced Migration] Step 7: Migrating vocabulary...');
    let vocabularySuccess = 0;
    if (!options.dryRun) {
      const vocabBatchSize = 200; // Vocabulary can be batched more aggressively
      for (let i = 0; i < firestoreData.vocabulary.length; i += vocabBatchSize) {
        const batch = firestoreData.vocabulary.slice(i, i + vocabBatchSize);
        const statements = batch.map(word => ({
          sql: `INSERT OR REPLACE INTO vocabulary (
            word_id, german_word, english_translation,
            part_of_speech, gender, level,
            example_sentence, example_translation, audio_url,
            frequency, tags, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            word.wordId || word.id,
            word.germanWord || word.german_word,
            word.englishTranslation || word.english_translation,
            word.partOfSpeech || word.part_of_speech || null,
            word.gender || null,
            word.level,
            word.exampleSentence || word.example_sentence || null,
            word.exampleTranslation || word.example_translation || null,
            word.audioUrl || word.audio_url || null,
            word.frequency || 5,
            word.tags ? JSON.stringify(word.tags) : '[]',
            word.createdAt || word.created_at || Date.now(),
          ],
        }));

        try {
          await db.batch(statements);
          vocabularySuccess += batch.length;
        } catch (error) {
          console.error('[Migration] Vocabulary batch failed:', error);
          allErrors.push({
            collection: 'vocabulary',
            recordId: `batch_${i}`,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } else {
      vocabularySuccess = firestoreData.vocabulary.length;
    }

    // Step 8: Migrate flashcard progress
    console.log('[Enhanced Migration] Step 8: Migrating flashcard progress...');
    let flashcardProgressSuccess = 0;
    if (!options.dryRun) {
      for (const progress of firestoreData.flashcardProgress) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO flashcard_progress (
              flashcard_id, user_id, word_id, level,
              state, repetitions, ease_factor, interval, next_review_date,
              correct_count, incorrect_count, consecutive_correct, consecutive_incorrect,
              last_review_date, mastery_level,
              lapse_count, last_lapse_date, first_seen_at,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              progress.flashcardId || progress.id,
              progress.userId || progress.user_id,
              progress.wordId || progress.word_id,
              progress.level || null,
              progress.state || 'new',
              progress.repetitions || 0,
              progress.easeFactor || progress.ease_factor || 2.5,
              progress.interval || 0,
              progress.nextReviewDate || progress.next_review_date,
              progress.correctCount || progress.correct_count || 0,
              progress.incorrectCount || progress.incorrect_count || 0,
              progress.consecutiveCorrect || progress.consecutive_correct || 0,
              progress.consecutiveIncorrect || progress.consecutive_incorrect || 0,
              progress.lastReviewDate || progress.last_review_date || null,
              progress.masteryLevel || progress.mastery_level || 0,
              progress.lapseCount || progress.lapse_count || 0,
              progress.lastLapseDate || progress.last_lapse_date || null,
              progress.firstSeenAt || progress.first_seen_at || null,
              progress.createdAt || progress.created_at || Date.now(),
              progress.updatedAt || progress.updated_at || Date.now(),
            ],
          });
          flashcardProgressSuccess++;
        } catch (error) {
          allErrors.push({
            collection: 'flashcard_progress',
            recordId: progress.flashcardId || progress.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } else {
      flashcardProgressSuccess = firestoreData.flashcardProgress.length;
    }

    // Step 9: Validation
    const validationResults: any = {};
    if (options.validateAfter && !options.dryRun) {
      console.log('[Enhanced Migration] Step 9: Validating migrated data...');
      validationResults.users = await validateMigration(firestoreData.users, 'users');
      validationResults.batches = await validateMigration(firestoreData.batches, 'batches');
      validationResults.vocabulary = await validateMigration(firestoreData.vocabulary, 'vocabulary');
      validationResults.flashcardProgress = await validateMigration(
        firestoreData.flashcardProgress,
        'flashcard_progress'
      );
    }

    // Step 10: Get final stats
    const finalStats = options.dryRun ? stats : await getTursoStats();

    const duration = Date.now() - startTime;

    console.log('[Enhanced Migration] Completed successfully');
    console.log(`[Enhanced Migration] Duration: ${Math.round(duration / 1000)}s`);
    console.log(`[Enhanced Migration] Total errors: ${allErrors.length}`);

    return NextResponse.json({
      success: true,
      dryRun: options.dryRun,
      stats: {
        users: usersResult.success,
        batches: batchesSuccess,
        vocabulary: vocabularySuccess,
        flashcardProgress: flashcardProgressSuccess,
        total: usersResult.success + batchesSuccess + vocabularySuccess + flashcardProgressSuccess,
      },
      finalStats,
      errors: allErrors.slice(0, 50), // Limit error list
      totalErrors: allErrors.length,
      validation: validationResults,
      duration: Math.round(duration / 1000), // seconds
      estimate: estimate,
    });
  } catch (error) {
    console.error('[Enhanced Migration] Error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
