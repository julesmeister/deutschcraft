/**
 * Grammar Service Module - Firebase Implementation
 *
 * This module handles all grammar exercise operations with Firestore.
 * Follows the same pattern as flashcard service for consistency.
 *
 * Collections:
 * - grammar-rules/{ruleId}
 * - grammar-sentences/{sentenceId}
 * - grammar-reviews/{userId}_{sentenceId}
 * - grammar-review-history/{historyId}
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import {
  GrammarRule,
  GrammarSentence,
  GrammarReview,
  GrammarReviewHistory,
  DifficultyRating,
} from '../../models/grammar';
import { CEFRLevel } from '../../models/cefr';

// ============================================================================
// READ OPERATIONS - Grammar Rules
// ============================================================================

/**
 * Get all grammar rules
 */
export async function getAllGrammarRules(): Promise<GrammarRule[]> {
  try {
    const rulesRef = collection(db, 'grammar-rules');
    const q = query(rulesRef, orderBy('order', 'asc'), orderBy('title', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as GrammarRule[];
  } catch (error) {
    console.error('[grammarService] Error fetching grammar rules:', error);
    throw error;
  }
}

/**
 * Get grammar rules by level
 */
export async function getGrammarRulesByLevel(level: CEFRLevel): Promise<GrammarRule[]> {
  try {
    const rulesRef = collection(db, 'grammar-rules');
    const q = query(
      rulesRef,
      where('level', '==', level),
      orderBy('order', 'asc'),
      orderBy('title', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as GrammarRule[];
  } catch (error) {
    console.error('[grammarService] Error fetching grammar rules by level:', error);
    throw error;
  }
}

/**
 * Get single grammar rule
 */
export async function getGrammarRule(ruleId: string): Promise<GrammarRule | null> {
  try {
    const ruleRef = doc(db, 'grammar-rules', ruleId);
    const ruleDoc = await getDoc(ruleRef);

    if (!ruleDoc.exists()) {
      return null;
    }

    return ruleDoc.data() as GrammarRule;
  } catch (error) {
    console.error('[grammarService] Error fetching grammar rule:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS - Grammar Sentences
// ============================================================================

/**
 * Get sentences for a grammar rule
 */
export async function getSentencesByRule(ruleId: string): Promise<GrammarSentence[]> {
  try {
    const sentencesRef = collection(db, 'grammar-sentences');
    const q = query(sentencesRef, where('ruleId', '==', ruleId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as GrammarSentence[];
  } catch (error) {
    console.error('[grammarService] Error fetching sentences by rule:', error);
    throw error;
  }
}

/**
 * Get sentences by level
 */
export async function getSentencesByLevel(level: CEFRLevel): Promise<GrammarSentence[]> {
  try {
    const sentencesRef = collection(db, 'grammar-sentences');
    const q = query(sentencesRef, where('level', '==', level));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as GrammarSentence[];
  } catch (error) {
    console.error('[grammarService] Error fetching sentences by level:', error);
    throw error;
  }
}

/**
 * Get single sentence
 */
export async function getSentence(sentenceId: string): Promise<GrammarSentence | null> {
  try {
    const sentenceRef = doc(db, 'grammar-sentences', sentenceId);
    const sentenceDoc = await getDoc(sentenceRef);

    if (!sentenceDoc.exists()) {
      return null;
    }

    return sentenceDoc.data() as GrammarSentence;
  } catch (error) {
    console.error('[grammarService] Error fetching sentence:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS - Grammar Reviews (Progress)
// ============================================================================

/**
 * Get all grammar reviews for a user
 */
export async function getGrammarReviews(userId: string): Promise<GrammarReview[]> {
  try {
    const reviewsRef = collection(db, 'grammar-reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as GrammarReview[];
  } catch (error) {
    console.error('[grammarService] Error fetching grammar reviews:', error);
    throw error;
  }
}

/**
 * Get single grammar review
 */
export async function getSingleGrammarReview(
  userId: string,
  sentenceId: string
): Promise<GrammarReview | null> {
  try {
    const reviewId = `${userId}_${sentenceId}`;
    const reviewRef = doc(db, 'grammar-reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (!reviewDoc.exists()) {
      return null;
    }

    return reviewDoc.data() as GrammarReview;
  } catch (error) {
    console.error('[grammarService] Error fetching single grammar review:', error);
    throw error;
  }
}

/**
 * Get reviews for a specific rule
 */
export async function getReviewsByRule(
  userId: string,
  ruleId: string
): Promise<GrammarReview[]> {
  try {
    const reviewsRef = collection(db, 'grammar-reviews');
    const q = query(
      reviewsRef,
      where('userId', '==', userId),
      where('ruleId', '==', ruleId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as GrammarReview[];
  } catch (error) {
    console.error('[grammarService] Error fetching reviews by rule:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS - Grammar Reviews
// ============================================================================

/**
 * Save or update grammar review
 */
export async function saveGrammarReview(
  reviewId: string,
  reviewData: Partial<GrammarReview>
): Promise<void> {
  try {
    const reviewRef = doc(db, 'grammar-reviews', reviewId);
    const now = Date.now();

    await setDoc(
      reviewRef,
      {
        ...reviewData,
        reviewId,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('[grammarService] Error saving grammar review:', error);
    throw error;
  }
}

/**
 * Save review history entry
 */
export async function saveGrammarReviewHistory(
  historyData: Omit<GrammarReviewHistory, 'historyId'>
): Promise<void> {
  try {
    const historyRef = doc(collection(db, 'grammar-review-history'));
    const historyId = historyRef.id;

    await setDoc(historyRef, {
      ...historyData,
      historyId,
    });
  } catch (error) {
    console.error('[grammarService] Error saving grammar review history:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS - Grammar Rules & Sentences (Admin)
// ============================================================================

/**
 * Create or update grammar rule
 */
export async function saveGrammarRule(
  ruleId: string,
  ruleData: Omit<GrammarRule, 'ruleId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const ruleRef = doc(db, 'grammar-rules', ruleId);
    const now = Date.now();

    const existingDoc = await getDoc(ruleRef);

    await setDoc(ruleRef, {
      ...ruleData,
      ruleId,
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[grammarService] Error saving grammar rule:', error);
    throw error;
  }
}

/**
 * Create or update grammar sentence
 */
export async function saveGrammarSentence(
  sentenceId: string,
  sentenceData: Omit<GrammarSentence, 'sentenceId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const sentenceRef = doc(db, 'grammar-sentences', sentenceId);
    const now = Date.now();

    const existingDoc = await getDoc(sentenceRef);

    await setDoc(sentenceRef, {
      ...sentenceData,
      sentenceId,
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('[grammarService] Error saving grammar sentence:', error);
    throw error;
  }
}
