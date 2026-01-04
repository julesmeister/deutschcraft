/**
 * Turso Flashcard Service - Progress Write Operations
 * Handles saving flashcard progress and daily study statistics
 */

import { db } from '@/turso/client';
import { FlashcardProgress } from '@/lib/models';

// ============================================================================
// WRITE OPERATIONS - Progress
// ============================================================================

/**
 * Save or update flashcard progress (Enhanced with SRS state tracking)
 * @param progressId - Combined ID (userId_flashcardId)
 * @param progressData - Flashcard progress data
 */
export async function saveFlashcardProgress(
  progressId: string,
  progressData: Partial<FlashcardProgress>,
  flashcardData?: any // Optional data to ensure referential integrity
): Promise<void> {
  try {
    const now = Date.now();
    let flashcardId = progressData.flashcardId || '';
    let finalProgressId = progressId;
    let wordId = progressData.wordId || flashcardData?.id || flashcardData?.wordId || '';

    // ========================================================================
    // ID NORMALIZATION LAYER - Handle multiple ID formats
    // ========================================================================

    // 1. Ensure user exists in Turso (critical for FK constraint)
    if (progressData.userId) {
      try {
        const userCheck = await db.execute({
          sql: `SELECT user_id FROM users WHERE user_id = ? LIMIT 1`,
          args: [progressData.userId],
        });

        if (!userCheck.rows || userCheck.rows.length === 0) {
          // User doesn't exist - create minimal user record
          await db.execute({
            sql: `INSERT OR IGNORE INTO users (user_id, email, created_at) VALUES (?, ?, ?)`,
            args: [progressData.userId, progressData.userId, now],
          });
          if (process.env.NODE_ENV === 'development') {
            console.log(`➕ [Created] User: ${progressData.userId}`);
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(`📍 [ID Match] Found user: ${progressData.userId}`);
          }
        }
      } catch (userError) {
        console.error('[flashcardService:turso] User check/create failed:', userError);
        throw new Error(`Cannot save progress: User validation failed. ${userError instanceof Error ? userError.message : String(userError)}`);
      }
    }

    // 2. Normalize flashcard ID
    if (flashcardId.startsWith('syllabus-') && !flashcardId.startsWith('FLASH_')) {
      flashcardId = `FLASH_${flashcardId}`;
    }

    // 3. Check if flashcard already exists in Turso (try multiple ID formats)
    let existingFlashcard = null;
    const idVariations = [
      flashcardId,
      `FLASH_${flashcardId}`,
      flashcardId.replace('FLASH_', ''),
      wordId,
      `FLASH_${wordId}`,
    ].filter(id => id && id.length > 0);

    for (const idVariant of idVariations) {
      try {
        const checkResult = await db.execute({
          sql: `SELECT id FROM flashcards WHERE id = ? LIMIT 1`,
          args: [idVariant],
        });
        if (checkResult.rows && checkResult.rows.length > 0) {
          existingFlashcard = checkResult.rows[0];
          flashcardId = idVariant; // Use the ID that exists in DB
          if (process.env.NODE_ENV === 'development') {
            console.log(`📍 [ID Match] Found flashcard with ID: ${idVariant}`);
          }
          break;
        }
      } catch (e) {
        // Continue trying other variants
      }
    }

    // 4. Update final progress ID with normalized flashcard ID
    if (progressData.userId) {
      finalProgressId = `${progressData.userId}_${flashcardId}`;
    }

    // If flashcardData is provided AND flashcard doesn't exist, ensure referenced records exist (Lazy Sync)
    if (flashcardData && !existingFlashcard) {
      try {
        const level = progressData.level || flashcardData.level || 'A1';

        // 5. Check if vocabulary exists (try multiple ID formats)
        let existingVocab = null;
        for (const wordIdVariant of [wordId, `VOCAB_${wordId}`, wordId.replace('VOCAB_', '')].filter(Boolean)) {
          try {
            const vocabCheck = await db.execute({
              sql: `SELECT word_id FROM vocabulary WHERE word_id = ? LIMIT 1`,
              args: [wordIdVariant],
            });
            if (vocabCheck.rows && vocabCheck.rows.length > 0) {
              existingVocab = vocabCheck.rows[0];
              wordId = wordIdVariant; // Use the ID that exists
              if (process.env.NODE_ENV === 'development') {
                console.log(`📍 [ID Match] Found vocabulary with ID: ${wordIdVariant}`);
              }
              break;
            }
          } catch (e) {
            // Continue trying
          }
        }

        // 6. Ensure Vocabulary exists (only if not found)
        if (!existingVocab) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO vocabulary (
              word_id, german_word, english_translation, level, created_at
            ) VALUES (?, ?, ?, ?, ?)`,
            args: [
              wordId,
              flashcardData.german || 'Unknown',
              flashcardData.english || 'Unknown',
              level,
              now
            ]
          });
          if (process.env.NODE_ENV === 'development') {
            console.log(`➕ [Created] Vocabulary: ${wordId}`);
          }
        }

        // 7. Ensure Flashcard exists (only if not found earlier)
        await db.execute({
          sql: `INSERT OR IGNORE INTO flashcards (
            id, word_id, question, correct_answer, wrong_answers, type, level, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            flashcardId,
            wordId,
            flashcardData.german || 'Unknown', // Question
            flashcardData.english || 'Unknown', // Answer
            '[]', // wrong_answers
            'translation', // type
            level,
            now
          ]
        });
        if (process.env.NODE_ENV === 'development') {
          console.log(`➕ [Created] Flashcard: ${flashcardId} -> ${wordId}`);
        }
      } catch (syncError) {
        console.error('[flashcardService:turso] Failed to sync flashcard data:', syncError);
        // Throw error instead of continuing - this prevents FK constraint failures
        throw new Error(`Cannot save progress: Failed to sync flashcard data. ${syncError instanceof Error ? syncError.message : String(syncError)}`);
      }
    }

    // Save progress with verification layer
    await db.execute({
      sql: `INSERT INTO flashcard_progress (
              id, flashcard_id, user_id, word_id, level,
              state,
              repetitions, ease_factor, interval, next_review_date,
              correct_count, incorrect_count, last_review_date, mastery_level,
              consecutive_correct, consecutive_incorrect,
              lapse_count, last_lapse_date,
              first_seen_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              state = excluded.state,
              repetitions = excluded.repetitions,
              ease_factor = excluded.ease_factor,
              interval = excluded.interval,
              next_review_date = excluded.next_review_date,
              correct_count = excluded.correct_count,
              incorrect_count = excluded.incorrect_count,
              last_review_date = excluded.last_review_date,
              mastery_level = excluded.mastery_level,
              consecutive_correct = excluded.consecutive_correct,
              consecutive_incorrect = excluded.consecutive_incorrect,
              lapse_count = excluded.lapse_count,
              last_lapse_date = excluded.last_lapse_date,
              updated_at = excluded.updated_at`,
      args: [
        finalProgressId,
        flashcardId, // Using normalized flashcard ID
        progressData.userId || '',
        wordId, // Using normalized word ID
        progressData.level || null,
        progressData.state || 'new',
        progressData.repetitions || 0,
        progressData.easeFactor || 2.5,
        progressData.interval || 1,
        progressData.nextReviewDate || now,
        progressData.correctCount || 0,
        progressData.incorrectCount || 0,
        progressData.lastReviewDate || null,
        progressData.masteryLevel || 0,
        progressData.consecutiveCorrect || 0,
        progressData.consecutiveIncorrect || 0,
        progressData.lapseCount || 0,
        progressData.lastLapseDate || null,
        progressData.firstSeenAt || now,
        progressData.createdAt || now,
        now,
      ],
    });

    // Verification layer: Confirm the save actually worked
    const verifyResult = await db.execute({
      sql: `SELECT id, next_review_date, mastery_level FROM flashcard_progress WHERE id = ?`,
      args: [finalProgressId],
    });

    if (!verifyResult.rows || verifyResult.rows.length === 0) {
      throw new Error(`Progress save verification failed: Record not found after save (ID: ${finalProgressId})`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [flashcardService:turso] Progress verified: ${finalProgressId} | Mastery: ${progressData.masteryLevel}% | Next: ${new Date(progressData.nextReviewDate || now).toLocaleDateString()}`);
    }
  } catch (error) {
    console.error('[flashcardService:turso] Error saving flashcard progress:', error);
    throw error;
  }
}

/**
 * Save or update daily study progress
 * @param userId - User's email
 * @param stats - Study statistics
 */
export async function saveDailyProgress(
  userId: string,
  stats: {
    cardsReviewed: number;
    timeSpent: number;
    correctCount: number;
    incorrectCount: number;
  }
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayFormatted = today.replace(/-/g, '');
    const progressId = `PROG_${todayFormatted}_${userId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO progress (
              progress_id, user_id, date,
              words_studied, words_correct, words_incorrect, time_spent,
              sessions_completed, cards_reviewed, sentences_created,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(progress_id) DO UPDATE SET
              cards_reviewed = cards_reviewed + excluded.cards_reviewed,
              time_spent = time_spent + excluded.time_spent,
              words_correct = words_correct + excluded.words_correct,
              words_incorrect = words_incorrect + excluded.words_incorrect,
              sessions_completed = sessions_completed + 1`,
      args: [
        progressId,
        userId,
        today,
        stats.cardsReviewed,
        stats.correctCount,
        stats.incorrectCount,
        stats.timeSpent,
        1,
        stats.cardsReviewed,
        0,
        now,
      ],
    });
  } catch (error) {
    console.error('[flashcardService:turso] Error saving daily progress:', error);
    throw error;
  }
}
