import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/turso/client';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Import data from JSON to Turso
 * POST /api/database/import
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
        { error: 'Only teachers can import data' },
        { status: 403 }
      );
    }

    console.log('[Import] Starting import to Turso...');

    // Parse request body
    const importData = await request.json();

    if (!importData.collections) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    const stats: any = {};

    // 1. Import users
    if (importData.collections.users) {
      console.log('[Import] Importing users...');
      const users = importData.collections.users;
      let count = 0;

      for (const user of users) {
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
              user.userId || user.email,
              user.email,
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
          count++;
        } catch (error) {
          console.error(`[Import] Error importing user ${user.email}:`, error);
        }
      }
      stats.users = count;
    }

    // 2. Import batches
    if (importData.collections.batches) {
      console.log('[Import] Importing batches...');
      const batches = importData.collections.batches;
      let count = 0;

      for (const batch of batches) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO batches (
              batch_id, teacher_id, name, description, current_level,
              is_active, start_date, end_date, student_count,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              batch.batchId || batch.batch_id,
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
          count++;
        } catch (error) {
          console.error(`[Import] Error importing batch ${batch.batchId}:`, error);
        }
      }
      stats.batches = count;
    }

    // 3. Import vocabulary
    if (importData.collections.vocabulary) {
      console.log('[Import] Importing vocabulary...');
      const vocabulary = importData.collections.vocabulary;
      let count = 0;

      for (const word of vocabulary) {
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
              word.wordId || word.word_id,
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
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing vocabulary ${word.wordId}:`, error);
        }
      }
      stats.vocabulary = count;
    }

    // 4. Import flashcard-progress
    if (importData.collections.flashcardProgress) {
      console.log('[Import] Importing flashcard progress...');
      const flashcardProgress = importData.collections.flashcardProgress;
      let count = 0;

      for (const progress of flashcardProgress) {
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
              progress.flashcardId || progress.flashcard_id,
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
          count++;
        } catch (error) {
          console.error(`[Import] Error importing flashcard progress:`, error);
        }
      }
      stats.flashcardProgress = count;
    }

    // 5. Import exercise-overrides
    if (importData.collections.exerciseOverrides) {
      console.log('[Import] Importing exercise-overrides...');
      const overrides = importData.collections.exerciseOverrides;
      let count = 0;

      for (const override of overrides) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO exercise_overrides (
              override_id, teacher_email, exercise_id, override_type,
              level, lesson_number, exercise_data, modifications,
              display_order, is_hidden, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              override.overrideId || override.override_id,
              override.teacherEmail || override.teacher_email,
              override.exerciseId || override.exercise_id,
              override.overrideType || override.override_type,
              override.level || null,
              override.lessonNumber || override.lesson_number || null,
              override.exerciseData || override.exercise_data ? JSON.stringify(override.exerciseData || override.exercise_data) : null,
              override.modifications ? JSON.stringify(override.modifications) : null,
              override.displayOrder || override.display_order || null,
              override.isHidden || override.is_hidden ? 1 : 0,
              override.notes || null,
              override.createdAt || override.created_at || Date.now(),
              override.updatedAt || override.updated_at || Date.now(),
            ],
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing override:`, error);
        }
      }
      stats.exerciseOverrides = count;
    }

    // 6. Import saved-vocabulary
    if (importData.collections.savedVocabulary) {
      console.log('[Import] Importing saved-vocabulary...');
      const savedVocab = importData.collections.savedVocabulary;
      let count = 0;

      for (const savedWord of savedVocab) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO saved_vocabulary (
              saved_vocab_id, user_id, word_id, flashcard_id,
              german, english, level, category, examples,
              times_used, target_uses, completed,
              saved_at, last_used_at, completed_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              savedWord.savedVocabId || savedWord.saved_vocab_id,
              savedWord.userId || savedWord.user_id,
              savedWord.wordId || savedWord.word_id,
              savedWord.flashcardId || savedWord.flashcard_id || null,
              savedWord.german,
              savedWord.english,
              savedWord.level,
              savedWord.category || null,
              savedWord.examples ? JSON.stringify(savedWord.examples) : null,
              savedWord.timesUsed || savedWord.times_used || 0,
              savedWord.targetUses || savedWord.target_uses || 5,
              savedWord.completed ? 1 : 0,
              savedWord.savedAt || savedWord.saved_at,
              savedWord.lastUsedAt || savedWord.last_used_at || null,
              savedWord.completedAt || savedWord.completed_at || null,
              savedWord.updatedAt || savedWord.updated_at || Date.now(),
            ],
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing saved vocabulary:`, error);
        }
      }
      stats.savedVocabulary = count;
    }

    // 7. Import activities
    if (importData.collections.activities) {
      console.log('[Import] Importing activities...');
      const activities = importData.collections.activities;
      let count = 0;

      for (const activity of activities) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO activities (
              activity_id, student_email, student_name, type, timestamp, metadata
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [
              activity.activityId || activity.activity_id,
              activity.studentEmail || activity.student_email,
              activity.studentName || activity.student_name || null,
              activity.type,
              activity.timestamp?.toMillis ? activity.timestamp.toMillis() : activity.timestamp,
              activity.metadata ? JSON.stringify(activity.metadata) : null,
            ],
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing activity:`, error);
        }
      }
      stats.activities = count;
    }

    // 8. Import grammar-rules
    if (importData.collections.grammarRules) {
      console.log('[Import] Importing grammar-rules...');
      const grammarRules = importData.collections.grammarRules;
      let count = 0;

      for (const rule of grammarRules) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO grammar_rules (
              rule_id, title, description, level, category, examples, explanation, "order", created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              rule.ruleId || rule.rule_id,
              rule.title,
              rule.description,
              rule.level,
              rule.category,
              rule.examples ? JSON.stringify(rule.examples) : null,
              rule.explanation || null,
              rule.order || 0,
              rule.createdAt || rule.created_at || Date.now(),
              rule.updatedAt || rule.updated_at || Date.now(),
            ],
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing grammar rule:`, error);
        }
      }
      stats.grammarRules = count;
    }

    // 9. Import grammar-sentences
    if (importData.collections.grammarSentences) {
      console.log('[Import] Importing grammar-sentences...');
      const grammarSentences = importData.collections.grammarSentences;
      let count = 0;

      for (const sentence of grammarSentences) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO grammar_sentences (
              sentence_id, rule_id, english, german, level, hints, keywords, difficulty, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              sentence.sentenceId || sentence.sentence_id,
              sentence.ruleId || sentence.rule_id,
              sentence.english,
              sentence.german,
              sentence.level,
              sentence.hints ? JSON.stringify(sentence.hints) : null,
              sentence.keywords ? JSON.stringify(sentence.keywords) : null,
              sentence.difficulty || null,
              sentence.createdAt || sentence.created_at || Date.now(),
              sentence.updatedAt || sentence.updated_at || Date.now(),
            ],
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing grammar sentence:`, error);
        }
      }
      stats.grammarSentences = count;
    }

    // 10. Import grammar-reviews
    if (importData.collections.grammarReviews) {
      console.log('[Import] Importing grammar-reviews...');
      const grammarReviews = importData.collections.grammarReviews;
      let count = 0;

      for (const review of grammarReviews) {
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO grammar_reviews (
              review_id, user_id, sentence_id, rule_id, level,
              repetitions, ease_factor, interval, next_review_date,
              correct_count, incorrect_count, consecutive_correct, consecutive_incorrect,
              mastery_level, last_review_date, last_attempt, first_seen_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              review.reviewId || review.review_id,
              review.userId || review.user_id,
              review.sentenceId || review.sentence_id,
              review.ruleId || review.rule_id,
              review.level,
              review.repetitions || 0,
              review.easeFactor || review.ease_factor || 2.5,
              review.interval || 0,
              review.nextReviewDate || review.next_review_date,
              review.correctCount || review.correct_count || 0,
              review.incorrectCount || review.incorrect_count || 0,
              review.consecutiveCorrect || review.consecutive_correct || 0,
              review.consecutiveIncorrect || review.consecutive_incorrect || 0,
              review.masteryLevel || review.mastery_level || 0,
              review.lastReviewDate || review.last_review_date || null,
              review.lastAttempt || review.last_attempt ? JSON.stringify(review.lastAttempt || review.last_attempt) : null,
              review.firstSeenAt || review.first_seen_at || null,
              review.createdAt || review.created_at || Date.now(),
              review.updatedAt || review.updated_at || Date.now(),
            ],
          });
          count++;
        } catch (error) {
          console.error(`[Import] Error importing grammar review:`, error);
        }
      }
      stats.grammarReviews = count;
    }

    // Calculate total
    stats.total = Object.values(stats).reduce(
      (sum: number, val: any) => sum + (typeof val === 'number' ? val : 0),
      0
    );

    console.log('[Import] Completed successfully:', stats);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Import] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
