/**
 * Saved Vocabulary Service Module
 *
 * This module handles all saved vocabulary CRUD operations.
 * Allows students to save words from flashcards and track usage in writing exercises.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import {
  SavedVocabulary,
  SavedVocabularyInput,
  IncrementResult,
} from '../../models/savedVocabulary';

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all saved vocabulary for a user
 * @param userId - User's email
 * @param includeCompleted - Whether to include completed words (default: false)
 * @returns Array of saved vocabulary objects
 */
export async function getSavedVocabulary(
  userId: string,
  includeCompleted: boolean = false
): Promise<SavedVocabulary[]> {
  try {
    const savedVocabRef = collection(db, 'saved-vocabulary');
    let q = query(
      savedVocabRef,
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    let savedWords = snapshot.docs.map(doc => doc.data()) as SavedVocabulary[];

    // Filter out completed words if not requested
    if (!includeCompleted) {
      savedWords = savedWords.filter(word => !word.completed);
    }

    return savedWords;
  } catch (error) {
    console.error('[savedVocabularyService] Error fetching saved vocabulary:', error);
    throw error;
  }
}

/**
 * Get a single saved vocabulary entry
 * @param userId - User's email
 * @param wordId - Word ID
 * @returns Saved vocabulary object or null
 */
export async function getSavedVocabularyEntry(
  userId: string,
  wordId: string
): Promise<SavedVocabulary | null> {
  try {
    const savedVocabId = `${userId}_${wordId}`;
    const savedVocabRef = doc(db, 'saved-vocabulary', savedVocabId);
    const savedVocabDoc = await getDoc(savedVocabRef);

    if (!savedVocabDoc.exists()) {
      return null;
    }

    return savedVocabDoc.data() as SavedVocabulary;
  } catch (error) {
    console.error('[savedVocabularyService] Error fetching saved vocabulary entry:', error);
    throw error;
  }
}

/**
 * Check if a word is saved
 * @param userId - User's email
 * @param wordId - Word ID
 * @returns True if word is saved, false otherwise
 */
export async function isWordSaved(userId: string, wordId: string): Promise<boolean> {
  try {
    const entry = await getSavedVocabularyEntry(userId, wordId);
    return entry !== null;
  } catch (error) {
    console.error('[savedVocabularyService] Error checking if word is saved:', error);
    return false;
  }
}

/**
 * Detect saved words in submitted text
 * @param userId - User's email
 * @param text - Submitted writing text
 * @returns Array of detected saved vocabulary objects
 */
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
    console.error('[savedVocabularyService] Error detecting saved words:', error);
    return [];
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Save vocabulary for later practice
 * @param userId - User's email
 * @param wordData - Word data to save
 */
export async function saveVocabularyForLater(
  userId: string,
  wordData: SavedVocabularyInput
): Promise<void> {
  try {
    const savedVocabId = `${userId}_${wordData.wordId}`;
    const savedVocabRef = doc(db, 'saved-vocabulary', savedVocabId);

    // Check if already saved
    const existingDoc = await getDoc(savedVocabRef);
    if (existingDoc.exists()) {
      throw new Error('Word already saved');
    }

    const now = Date.now();
    const savedVocabulary: SavedVocabulary = {
      savedVocabId,
      userId,
      wordId: wordData.wordId,
      flashcardId: wordData.flashcardId,
      german: wordData.german,
      english: wordData.english,
      level: wordData.level,
      category: wordData.category,
      examples: wordData.examples,
      timesUsed: 0,
      targetUses: 5,
      completed: false,
      savedAt: now,
      updatedAt: now,
    };

    await setDoc(savedVocabRef, savedVocabulary);
  } catch (error) {
    console.error('[savedVocabularyService] Error saving vocabulary:', error);
    throw error;
  }
}

/**
 * Increment vocabulary usage counter
 * @param userId - User's email
 * @param wordId - Word ID
 * @returns Result with completion status and new usage count
 */
export async function incrementVocabularyUsage(
  userId: string,
  wordId: string
): Promise<IncrementResult> {
  try {
    const savedVocabId = `${userId}_${wordId}`;
    const savedVocabRef = doc(db, 'saved-vocabulary', savedVocabId);
    const savedVocabDoc = await getDoc(savedVocabRef);

    if (!savedVocabDoc.exists()) {
      throw new Error('Saved vocabulary entry not found');
    }

    const currentData = savedVocabDoc.data() as SavedVocabulary;
    const newTimesUsed = currentData.timesUsed + 1;
    const newCompleted = newTimesUsed >= currentData.targetUses;

    const updateData: Partial<SavedVocabulary> = {
      timesUsed: currentData.timesUsed + 1,
      lastUsedAt: Date.now(),
      completed: newCompleted,
      updatedAt: Date.now(),
    };

    // Set completedAt only when first completing
    if (newCompleted && !currentData.completed) {
      updateData.completedAt = Date.now();
    }

    await updateDoc(savedVocabRef, updateData);

    return {
      wordId,
      completed: newCompleted,
      timesUsed: newTimesUsed,
    };
  } catch (error) {
    console.error('[savedVocabularyService] Error incrementing vocabulary usage:', error);
    throw error;
  }
}

/**
 * Bulk increment vocabulary usage for multiple words
 * @param userId - User's email
 * @param wordIds - Array of word IDs
 * @returns Array of increment results
 */
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
      console.error(`[savedVocabularyService] Failed to increment ${wordId}:`, error);
      // Continue with other words even if one fails
    }
  }

  return results;
}

/**
 * Remove saved vocabulary
 * @param userId - User's email
 * @param wordId - Word ID
 */
export async function removeSavedVocabulary(
  userId: string,
  wordId: string
): Promise<void> {
  try {
    const savedVocabId = `${userId}_${wordId}`;
    const savedVocabRef = doc(db, 'saved-vocabulary', savedVocabId);

    await deleteDoc(savedVocabRef);
  } catch (error) {
    console.error('[savedVocabularyService] Error removing saved vocabulary:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Escape special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
