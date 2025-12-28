import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/turso/client';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Direct migration from Firestore to Turso
 * POST /api/database/migrate
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
        { error: 'Only teachers can migrate data' },
        { status: 403 }
      );
    }

    console.log('[Migrate] Starting direct migration from Firestore to Turso...');

    // Disable foreign key constraints during migration
    // This allows us to migrate data even when referenced records don't exist
    // (e.g., flashcard-progress can reference users that are staying in Firebase)
    await db.execute('PRAGMA foreign_keys = OFF');
    console.log('[Migrate] Foreign key constraints disabled');

    const stats: any = {};

    // 1. Migrate users
    console.log('[Migrate] Migrating users...');
    const usersSnapshot = await adminDb.collection('users').get();
    let userCount = 0;

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO users (
            user_id, email, first_name, last_name, role, photo_url,
            cefr_level, teacher_id, batch_id,
            words_learned, words_mastered, sentences_created, sentences_perfect,
            current_streak, longest_streak, total_practice_time, daily_goal, last_active_date,
            notifications_enabled, sound_enabled, flashcard_settings,
            total_students, active_batches,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            user.userId || user.email || doc.id,
            user.email || doc.id,
            user.firstName || user.first_name || '',
            user.lastName || user.last_name || '',
            user.role || 'STUDENT',
            user.photoURL || user.photo_url || null,
            user.cefrLevel || user.cefr_level || null,
            user.teacherId || user.teacher_id || null,
            user.batchId || user.batch_id || null,
            user.wordsLearned || user.words_learned || 0,
            user.wordsMastered || user.words_mastered || 0,
            user.sentencesCreated || user.sentences_created || 0,
            user.sentencesPerfect || user.sentences_perfect || 0,
            user.currentStreak || user.current_streak || 0,
            user.longestStreak || user.longest_streak || 0,
            user.totalPracticeTime || user.total_practice_time || 0,
            user.dailyGoal || user.daily_goal || 20,
            user.lastActiveDate || user.last_active_date || null,
            user.notificationsEnabled ?? user.notifications_enabled ?? true,
            user.soundEnabled ?? user.sound_enabled ?? true,
            user.flashcardSettings || user.flashcard_settings
              ? JSON.stringify(user.flashcardSettings || user.flashcard_settings)
              : null,
            user.totalStudents || user.total_students || 0,
            user.activeBatches || user.active_batches || 0,
            user.createdAt || user.created_at || Date.now(),
            user.updatedAt || user.updated_at || Date.now(),
          ],
        });
        userCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating user ${user.email}:`, error);
      }
    }
    stats.users = userCount;

    // 2. Migrate batches
    console.log('[Migrate] Migrating batches...');
    const batchesSnapshot = await adminDb.collection('batches').get();
    let batchCount = 0;

    for (const doc of batchesSnapshot.docs) {
      const batch = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO batches (
            batch_id, teacher_id, name, description, current_level,
            is_active, start_date, end_date, student_count,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            batch.batchId || doc.id,
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
        batchCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating batch ${batch.batchId}:`, error);
      }
    }
    stats.batches = batchCount;

    // 3. Migrate tasks
    console.log('[Migrate] Migrating tasks...');
    const tasksSnapshot = await adminDb.collection('tasks').get();
    let taskCount = 0;

    for (const doc of tasksSnapshot.docs) {
      const task = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO tasks (
            task_id, batch_id, teacher_id, title, description, instructions,
            category, level, status, priority,
            assigned_date, due_date, estimated_duration,
            assigned_students, completed_students,
            min_words, max_words, min_paragraphs, max_paragraphs,
            required_vocabulary, total_points,
            require_introduction, require_conclusion, require_examples,
            tone, perspective,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            task.taskId || doc.id,
            task.batchId,
            task.teacherId,
            task.title,
            task.description || null,
            task.instructions,
            task.category,
            task.level,
            task.status,
            task.priority,
            task.assignedDate || null,
            task.dueDate,
            task.estimatedDuration || null,
            task.assignedStudents ? JSON.stringify(task.assignedStudents) : '[]',
            task.completedStudents ? JSON.stringify(task.completedStudents) : '[]',
            task.minWords || null,
            task.maxWords || null,
            task.minParagraphs || null,
            task.maxParagraphs || null,
            task.requiredVocabulary ? JSON.stringify(task.requiredVocabulary) : null,
            task.totalPoints || null,
            task.requireIntroduction ?? false,
            task.requireConclusion ?? false,
            task.requireExamples ?? false,
            task.tone || null,
            task.perspective || null,
            task.createdAt || Date.now(),
            task.updatedAt || Date.now(),
          ],
        });
        taskCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating task ${task.taskId}:`, error);
      }
    }
    stats.tasks = taskCount;

    // 4. Migrate submissions
    console.log('[Migrate] Migrating submissions...');
    const submissionsSnapshot = await adminDb.collection('submissions').get();
    let submissionCount = 0;

    for (const doc of submissionsSnapshot.docs) {
      const submission = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO submissions (
            submission_id, task_id, student_id, batch_id,
            content, word_count, status,
            started_at, submitted_at, graded_at,
            score, max_score, feedback, graded_by,
            version, revisions,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            submission.submissionId || doc.id,
            submission.taskId,
            submission.studentId,
            submission.batchId,
            submission.content,
            submission.wordCount,
            submission.status,
            submission.startedAt || null,
            submission.submittedAt || null,
            submission.gradedAt || null,
            submission.score || null,
            submission.maxScore || null,
            submission.feedback || null,
            submission.gradedBy || null,
            submission.version || 1,
            submission.revisions ? JSON.stringify(submission.revisions) : '[]',
            submission.createdAt || Date.now(),
            submission.updatedAt || Date.now(),
          ],
        });
        submissionCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating submission ${submission.submissionId}:`, error);
      }
    }
    stats.submissions = submissionCount;

    // 5. Migrate progress
    console.log('[Migrate] Migrating progress...');
    const progressSnapshot = await adminDb.collection('progress').get();
    let progressCount = 0;

    for (const doc of progressSnapshot.docs) {
      const progress = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO progress (
            progress_id, user_id, date,
            words_studied, words_correct, words_incorrect, time_spent,
            sessions_completed, cards_reviewed, sentences_created,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            progress.progressId || doc.id,
            progress.userId,
            progress.date,
            progress.wordsStudied || 0,
            progress.wordsCorrect || 0,
            progress.wordsIncorrect || 0,
            progress.timeSpent || 0,
            progress.sessionsCompleted || 0,
            progress.cardsReviewed || 0,
            progress.sentencesCreated || 0,
            progress.createdAt || Date.now(),
          ],
        });
        progressCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating progress ${progress.progressId}:`, error);
      }
    }
    stats.progress = progressCount;

    // 6. Migrate vocabulary
    console.log('[Migrate] Migrating vocabulary...');
    const vocabularySnapshot = await adminDb.collection('vocabulary').get();
    let vocabularyCount = 0;

    for (const doc of vocabularySnapshot.docs) {
      const word = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO vocabulary (
            word_id, german_word, english_translation,
            part_of_speech, gender, level,
            example_sentence, example_translation, audio_url,
            frequency, tags,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            word.wordId || doc.id,
            word.germanWord,
            word.englishTranslation,
            word.partOfSpeech || null,
            word.gender || null,
            word.level,
            word.exampleSentence || null,
            word.exampleTranslation || null,
            word.audioUrl || null,
            word.frequency || 5,
            word.tags ? JSON.stringify(word.tags) : '[]',
            word.createdAt || Date.now(),
          ],
        });
        vocabularyCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating vocabulary ${word.wordId}:`, error);
      }
    }
    stats.vocabulary = vocabularyCount;

    // 7. Migrate flashcards
    console.log('[Migrate] Migrating flashcards...');
    const flashcardsSnapshot = await adminDb.collection('flashcards').get();
    let flashcardCount = 0;

    for (const doc of flashcardsSnapshot.docs) {
      const flashcard = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO flashcards (
            id, word_id, question, correct_answer, wrong_answers,
            type, level, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            flashcard.id || doc.id,
            flashcard.wordId,
            flashcard.question,
            flashcard.correctAnswer,
            flashcard.wrongAnswers ? JSON.stringify(flashcard.wrongAnswers) : '[]',
            flashcard.type,
            flashcard.level,
            flashcard.createdAt || Date.now(),
          ],
        });
        flashcardCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating flashcard ${flashcard.id}:`, error);
      }
    }
    stats.flashcards = flashcardCount;

    // 8. Migrate flashcard-progress
    console.log('[Migrate] Migrating flashcard-progress...');
    const flashcardProgressSnapshot = await adminDb.collection('flashcard-progress').get();
    let flashcardProgressCount = 0;

    for (const doc of flashcardProgressSnapshot.docs) {
      const progress = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO flashcard_progress (
            id, flashcard_id, user_id, word_id,
            repetitions, ease_factor, interval, next_review_date,
            correct_count, incorrect_count,
            last_review_date, mastery_level,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            `${progress.userId}_${progress.flashcardId}`, // id
            progress.flashcardId || doc.id,
            progress.userId,
            progress.wordId,
            progress.repetitions || 0,
            progress.easeFactor || 2.5,
            progress.interval || 0,
            progress.nextReviewDate,
            progress.correctCount || 0,
            progress.incorrectCount || 0,
            progress.lastReviewDate || null,
            progress.masteryLevel || 0,
            progress.createdAt || Date.now(),
            progress.updatedAt || Date.now(),
          ],
        });
        flashcardProgressCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating flashcard progress:`, error);
      }
    }
    stats.flashcardProgress = flashcardProgressCount;

    // 9. Migrate exercise-overrides
    console.log('[Migrate] Migrating exercise-overrides...');
    const overridesSnapshot = await adminDb.collection('exercise-overrides').get();
    let overrideCount = 0;

    for (const doc of overridesSnapshot.docs) {
      const override = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO exercise_overrides (
            override_id, teacher_email, exercise_id, override_type,
            level, lesson_number, exercise_data, modifications,
            display_order, is_hidden, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            override.overrideId || doc.id,
            override.teacherEmail,
            override.exerciseId,
            override.overrideType,
            override.level || null,
            override.lessonNumber || null,
            override.exerciseData ? JSON.stringify(override.exerciseData) : null,
            override.modifications ? JSON.stringify(override.modifications) : null,
            override.displayOrder || null,
            override.isHidden ? 1 : 0,
            override.notes || null,
            override.createdAt || Date.now(),
            override.updatedAt || Date.now(),
          ],
        });
        overrideCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating override ${override.overrideId}:`, error);
      }
    }
    stats.exerciseOverrides = overrideCount;

    // 10. Migrate saved-vocabulary
    console.log('[Migrate] Migrating saved-vocabulary...');
    const savedVocabSnapshot = await adminDb.collection('saved-vocabulary').get();
    let savedVocabCount = 0;

    for (const doc of savedVocabSnapshot.docs) {
      const savedWord = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO saved_vocabulary (
            saved_vocab_id, user_id, word_id, flashcard_id,
            german, english, level, category, examples,
            times_used, target_uses, completed,
            saved_at, last_used_at, completed_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            savedWord.savedVocabId || doc.id,
            savedWord.userId,
            savedWord.wordId,
            savedWord.flashcardId || null,
            savedWord.german,
            savedWord.english,
            savedWord.level,
            savedWord.category || null,
            savedWord.examples ? JSON.stringify(savedWord.examples) : null,
            savedWord.timesUsed || 0,
            savedWord.targetUses || 5,
            savedWord.completed ? 1 : 0,
            savedWord.savedAt,
            savedWord.lastUsedAt || null,
            savedWord.completedAt || null,
            savedWord.updatedAt || Date.now(),
          ],
        });
        savedVocabCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating saved vocabulary:`, error);
      }
    }
    stats.savedVocabulary = savedVocabCount;

    // 11. Migrate activities
    console.log('[Migrate] Migrating activities...');
    const activitiesSnapshot = await adminDb.collection('activities').get();
    let activityCount = 0;

    for (const doc of activitiesSnapshot.docs) {
      const activity = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO activities (
            activity_id, student_email, student_name, type, timestamp, metadata
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            activity.activityId || doc.id,
            activity.studentEmail,
            activity.studentName || null,
            activity.type,
            activity.timestamp?.toMillis ? activity.timestamp.toMillis() : activity.timestamp,
            activity.metadata ? JSON.stringify(activity.metadata) : null,
          ],
        });
        activityCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating activity:`, error);
      }
    }
    stats.activities = activityCount;

    // 12. Migrate grammar-rules
    console.log('[Migrate] Migrating grammar-rules...');
    const grammarRulesSnapshot = await adminDb.collection('grammar-rules').get();
    let grammarRuleCount = 0;

    for (const doc of grammarRulesSnapshot.docs) {
      const rule = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO grammar_rules (
            rule_id, title, description, level, category, examples, explanation, "order", created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            rule.ruleId || doc.id,
            rule.title,
            rule.description,
            rule.level,
            rule.category,
            rule.examples ? JSON.stringify(rule.examples) : null,
            rule.explanation || null,
            rule.order || 0,
            rule.createdAt || Date.now(),
            rule.updatedAt || Date.now(),
          ],
        });
        grammarRuleCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating grammar rule:`, error);
      }
    }
    stats.grammarRules = grammarRuleCount;

    // 13. Migrate grammar-sentences
    console.log('[Migrate] Migrating grammar-sentences...');
    const grammarSentencesSnapshot = await adminDb.collection('grammar-sentences').get();
    let grammarSentenceCount = 0;

    for (const doc of grammarSentencesSnapshot.docs) {
      const sentence = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO grammar_sentences (
            sentence_id, rule_id, english, german, level, hints, keywords, difficulty, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            sentence.sentenceId || doc.id,
            sentence.ruleId,
            sentence.english,
            sentence.german,
            sentence.level,
            sentence.hints ? JSON.stringify(sentence.hints) : null,
            sentence.keywords ? JSON.stringify(sentence.keywords) : null,
            sentence.difficulty || null,
            sentence.createdAt || Date.now(),
            sentence.updatedAt || Date.now(),
          ],
        });
        grammarSentenceCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating grammar sentence:`, error);
      }
    }
    stats.grammarSentences = grammarSentenceCount;

    // 14. Migrate grammar-reviews
    console.log('[Migrate] Migrating grammar-reviews...');
    const grammarReviewsSnapshot = await adminDb.collection('grammar-reviews').get();
    let grammarReviewCount = 0;

    for (const doc of grammarReviewsSnapshot.docs) {
      const review = doc.data();
      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO grammar_reviews (
            review_id, user_id, sentence_id, rule_id, level,
            repetitions, ease_factor, interval, next_review_date,
            correct_count, incorrect_count, consecutive_correct, consecutive_incorrect,
            mastery_level, last_review_date, last_attempt, first_seen_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            review.reviewId || doc.id,
            review.userId,
            review.sentenceId,
            review.ruleId,
            review.level,
            review.repetitions || 0,
            review.easeFactor || 2.5,
            review.interval || 0,
            review.nextReviewDate,
            review.correctCount || 0,
            review.incorrectCount || 0,
            review.consecutiveCorrect || 0,
            review.consecutiveIncorrect || 0,
            review.masteryLevel || 0,
            review.lastReviewDate || null,
            review.lastAttempt ? JSON.stringify(review.lastAttempt) : null,
            review.firstSeenAt || null,
            review.createdAt || Date.now(),
            review.updatedAt || Date.now(),
          ],
        });
        grammarReviewCount++;
      } catch (error) {
        console.error(`[Migrate] Error migrating grammar review:`, error);
      }
    }
    stats.grammarReviews = grammarReviewCount;

    // Calculate total
    stats.total = Object.values(stats).reduce(
      (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
      0
    );

    // Re-enable foreign key constraints
    await db.execute('PRAGMA foreign_keys = ON');
    console.log('[Migrate] Foreign key constraints re-enabled');

    console.log('[Migrate] Completed successfully:', stats);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Migrate] Error:', error);

    // Re-enable foreign keys even on error
    try {
      await db.execute('PRAGMA foreign_keys = ON');
    } catch (pragmaError) {
      console.error('[Migrate] Failed to re-enable foreign keys:', pragmaError);
    }

    return NextResponse.json(
      { error: 'Failed to migrate data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
