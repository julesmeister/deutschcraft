/**
 * Saved Vocabulary Service - Turso Implementation
 * Handles student saved vocabulary tracking and usage counting
 */

import { db } from '@/turso/client';
import {
  SavedVocabulary,
  SavedVocabularyInput,
  IncrementResult,
} from '@/lib/models/savedVocabulary';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToSavedVocabulary(row: any): SavedVocabulary {
  return {
    savedVocabId: row.saved_vocab_id as string,
    userId: row.user_id as string,
    wordId: row.word_id as string,
    flashcardId: row.flashcard_id as string | undefined,
    german: row.german as string,
    english: row.english as string,
    level: row.level as any,
    category: row.category as string | undefined,
    examples: row.examples ? JSON.parse(row.examples as string) : undefined,
    timesUsed: row.times_used as number,
    targetUses: row.target_uses as number,
    completed: Boolean(row.completed),
    savedAt: row.saved_at as number,
    lastUsedAt: row.last_used_at as number | undefined,
    completedAt: row.completed_at as number | undefined,
    updatedAt: row.updated_at as number,
  };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getSavedVocabulary(
  userId: string,
  includeCompleted: boolean = false
): Promise<SavedVocabulary[]> {
  try {
    let sql = 'SELECT * FROM saved_vocabulary WHERE user_id = ?';
    const args: any[] = [userId];

    if (!includeCompleted) {
      sql += ' AND completed = 0';
    }

    sql += ' ORDER BY saved_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToSavedVocabulary);
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error fetching saved vocabulary:', error);
    throw error;
  }
}

export async function getSavedVocabularyEntry(
  userId: string,
  wordId: string
): Promise<SavedVocabulary | null> {
  try {
    const savedVocabId = `${userId}_${wordId}`;
    const result = await db.execute({
      sql: 'SELECT * FROM saved_vocabulary WHERE saved_vocab_id = ?',
      args: [savedVocabId],
    });

    if (result.rows.length === 0) return null;
    return rowToSavedVocabulary(result.rows[0]);
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error fetching saved vocabulary entry:', error);
    throw error;
  }
}

export async function isWordSaved(userId: string, wordId: string): Promise<boolean> {
  try {
    const entry = await getSavedVocabularyEntry(userId, wordId);
    return entry !== null;
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error checking if word is saved:', error);
    return false;
  }
}

export async function detectSavedWordsInText(
  userId: string,
  text: string
): Promise<SavedVocabulary[]> {
  try {
    // Get only incomplete saved words
    const savedWords = await getSavedVocabulary(userId, false);

    if (savedWords.length === 0 || !text) {
      return [];
    }

    const textLower = text.toLowerCase();

    // Filter words that appear in the text
    return savedWords.filter(word => {
      const germanLower = word.german.toLowerCase();
      // Use word boundary regex for accurate detection
      const regex = new RegExp(`\\b${escapeRegex(germanLower)}\\b`, 'i');
      return regex.test(text);
    });
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error detecting saved words:', error);
    return [];
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function saveVocabularyForLater(
  userId: string,
  wordData: SavedVocabularyInput
): Promise<void> {
  try {
    const savedVocabId = `${userId}_${wordData.wordId}`;

    // Check if already saved
    const existing = await getSavedVocabularyEntry(userId, wordData.wordId);
    if (existing) {
      throw new Error('Word already saved');
    }

    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO saved_vocabulary (
              saved_vocab_id, user_id, word_id, flashcard_id,
              german, english, level, category, examples,
              times_used, target_uses, completed,
              saved_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        savedVocabId,
        userId,
        wordData.wordId,
        wordData.flashcardId || null,
        wordData.german,
        wordData.english,
        wordData.level,
        wordData.category || null,
        wordData.examples ? JSON.stringify(wordData.examples) : null,
        0, // times_used
        5, // target_uses
        0, // completed (false)
        now,
        now,
      ],
    });
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error saving vocabulary:', error);
    throw error;
  }
}

export async function incrementVocabularyUsage(
  userId: string,
  wordId: string
): Promise<IncrementResult> {
  try {
    const savedVocabId = `${userId}_${wordId}`;

    // Get current data
    const entry = await getSavedVocabularyEntry(userId, wordId);
    if (!entry) {
      throw new Error('Saved vocabulary entry not found');
    }

    const newTimesUsed = entry.timesUsed + 1;
    const newCompleted = newTimesUsed >= entry.targetUses;
    const now = Date.now();

    // Build update query
    let sql = `UPDATE saved_vocabulary SET
                 times_used = ?,
                 last_used_at = ?,
                 completed = ?,
                 updated_at = ?`;
    let args: any[] = [newTimesUsed, now, newCompleted ? 1 : 0, now];

    // Set completedAt only when first completing
    if (newCompleted && !entry.completed) {
      sql += ', completed_at = ?';
      args.push(now);
    }

    sql += ' WHERE saved_vocab_id = ?';
    args.push(savedVocabId);

    await db.execute({ sql, args });

    return {
      wordId,
      completed: newCompleted,
      timesUsed: newTimesUsed,
    };
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error incrementing vocabulary usage:', error);
    throw error;
  }
}

export async function bulkIncrementVocabularyUsage(
  userId: string,
  wordIds: string[]
): Promise<IncrementResult[]> {
  const results: IncrementResult[] = [];

  for (const wordId of wordIds) {
    try {
      const result = await incrementVocabularyUsage(userId, wordId);
      results.push(result);
    } catch (error) {
      console.error(`[savedVocabularyService:turso] Failed to increment ${wordId}:`, error);
      // Continue with other words even if one fails
    }
  }

  return results;
}

export async function removeSavedVocabulary(
  userId: string,
  wordId: string
): Promise<void> {
  try {
    const savedVocabId = `${userId}_${wordId}`;
    await db.execute({
      sql: 'DELETE FROM saved_vocabulary WHERE saved_vocab_id = ?',
      args: [savedVocabId],
    });
  } catch (error) {
    console.error('[savedVocabularyService:turso] Error removing saved vocabulary:', error);
    throw error;
  }
}
