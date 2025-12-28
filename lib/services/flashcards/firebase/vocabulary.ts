/**
 * Vocabulary Service Module - Vocabulary and Flashcard Read Operations
 *
 * This module handles all vocabulary word and flashcard retrieval operations.
 * Separated from flashcardService.ts to maintain files under 300 lines.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 */

import { db } from '../../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  Flashcard,
  VocabularyWord,
} from '../../../models/flashcard';
import { CEFRLevel } from '../../../models/cefr';

// ============================================================================
// READ OPERATIONS - Flashcards
// ============================================================================

/**
 * Get flashcards by level
 * @param level - CEFR level (A1-C2)
 * @returns Array of flashcard objects
 */
export async function getFlashcardsByLevel(level: CEFRLevel): Promise<Flashcard[]> {
  try {
    const flashcardsRef = collection(db, 'flashcards');
    const q = query(
      flashcardsRef,
      where('level', '==', level),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Flashcard[];
  } catch (error) {
    console.error('[flashcardService] Error fetching flashcards:', error);
    throw error;
  }
}

/**
 * Get vocabulary word by ID
 * @param wordId - Vocabulary word ID
 * @returns Vocabulary word object or null
 */
export async function getVocabularyWord(wordId: string): Promise<VocabularyWord | null> {
  try {
    const vocabRef = doc(db, 'vocabulary', wordId);
    const vocabDoc = await getDoc(vocabRef);

    if (!vocabDoc.exists()) {
      return null;
    }

    return vocabDoc.data() as VocabularyWord;
  } catch (error) {
    console.error('[flashcardService] Error fetching vocabulary word:', error);
    throw error;
  }
}

/**
 * Get all vocabulary words by level
 * @param level - CEFR level (A1-C2)
 * @returns Array of vocabulary words
 */
export async function getVocabularyByLevel(level: CEFRLevel): Promise<VocabularyWord[]> {
  try {
    const vocabRef = collection(db, 'vocabulary');
    const q = query(vocabRef, where('level', '==', level));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data()) as VocabularyWord[];
  } catch (error) {
    console.error('[flashcardService] Error fetching vocabulary:', error);
    throw error;
  }
}
