/**
 * Grammar Service Module - Turso Implementation
 *
 * This module handles all grammar exercise operations with Turso (SQLite).
 * Follows the same pattern as flashcard service for consistency.
 *
 * Tables:
 * - grammar_rules
 * - grammar_sentences
 * - grammar_reviews
 * - grammar_review_history
 */

import { db } from '@/turso/client';
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
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_rules ORDER BY "order" ASC, title ASC',
      args: [],
    });

    return result.rows.map(rowToGrammarRule);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching grammar rules:', error);
    throw error;
  }
}

/**
 * Get grammar rules by level
 */
export async function getGrammarRulesByLevel(level: CEFRLevel): Promise<GrammarRule[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_rules WHERE level = ? ORDER BY "order" ASC, title ASC',
      args: [level],
    });

    return result.rows.map(rowToGrammarRule);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching grammar rules by level:', error);
    throw error;
  }
}

/**
 * Get single grammar rule
 */
export async function getGrammarRule(ruleId: string): Promise<GrammarRule | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_rules WHERE rule_id = ? LIMIT 1',
      args: [ruleId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToGrammarRule(result.rows[0]);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching grammar rule:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_sentences WHERE rule_id = ?',
      args: [ruleId],
    });

    return result.rows.map(rowToGrammarSentence);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching sentences by rule:', error);
    throw error;
  }
}

/**
 * Get sentences by level
 */
export async function getSentencesByLevel(level: CEFRLevel): Promise<GrammarSentence[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_sentences WHERE level = ?',
      args: [level],
    });

    return result.rows.map(rowToGrammarSentence);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching sentences by level:', error);
    throw error;
  }
}

/**
 * Get single sentence
 */
export async function getSentence(sentenceId: string): Promise<GrammarSentence | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_sentences WHERE sentence_id = ? LIMIT 1',
      args: [sentenceId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToGrammarSentence(result.rows[0]);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching sentence:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_reviews WHERE user_id = ? ORDER BY updated_at DESC',
      args: [userId],
    });

    return result.rows.map(rowToGrammarReview);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching grammar reviews:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_reviews WHERE review_id = ? LIMIT 1',
      args: [reviewId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToGrammarReview(result.rows[0]);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching single grammar review:', error);
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
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_reviews WHERE user_id = ? AND rule_id = ?',
      args: [userId, ruleId],
    });

    return result.rows.map(rowToGrammarReview);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching reviews by rule:', error);
    throw error;
  }
}

/**
 * Get due grammar sentences for review
 */
export async function getDueGrammarSentences(
  userId: string,
  limit = 20
): Promise<GrammarReview[]> {
  try {
    const now = Date.now();
    const result = await db.execute({
      sql: 'SELECT * FROM grammar_reviews WHERE user_id = ? AND next_review_date <= ? ORDER BY next_review_date ASC LIMIT ?',
      args: [userId, now, limit],
    });

    return result.rows.map(rowToGrammarReview);
  } catch (error) {
    console.error('[grammarService:turso] Error fetching due grammar sentences:', error);
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
    const now = Date.now();

    // Check if review exists
    const existing = await db.execute({
      sql: 'SELECT review_id FROM grammar_reviews WHERE review_id = ? LIMIT 1',
      args: [reviewId],
    });

    if (existing.rows.length > 0) {
      // Update existing review
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (reviewData.repetitions !== undefined) {
        updateFields.push('repetitions = ?');
        updateValues.push(reviewData.repetitions);
      }
      if (reviewData.easeFactor !== undefined) {
        updateFields.push('ease_factor = ?');
        updateValues.push(reviewData.easeFactor);
      }
      if (reviewData.interval !== undefined) {
        updateFields.push('interval = ?');
        updateValues.push(reviewData.interval);
      }
      if (reviewData.nextReviewDate !== undefined) {
        updateFields.push('next_review_date = ?');
        updateValues.push(reviewData.nextReviewDate);
      }
      if (reviewData.correctCount !== undefined) {
        updateFields.push('correct_count = ?');
        updateValues.push(reviewData.correctCount);
      }
      if (reviewData.incorrectCount !== undefined) {
        updateFields.push('incorrect_count = ?');
        updateValues.push(reviewData.incorrectCount);
      }
      if (reviewData.consecutiveCorrect !== undefined) {
        updateFields.push('consecutive_correct = ?');
        updateValues.push(reviewData.consecutiveCorrect);
      }
      if (reviewData.consecutiveIncorrect !== undefined) {
        updateFields.push('consecutive_incorrect = ?');
        updateValues.push(reviewData.consecutiveIncorrect);
      }
      if (reviewData.masteryLevel !== undefined) {
        updateFields.push('mastery_level = ?');
        updateValues.push(reviewData.masteryLevel);
      }
      if (reviewData.lastReviewDate !== undefined) {
        updateFields.push('last_review_date = ?');
        updateValues.push(reviewData.lastReviewDate);
      }
      if (reviewData.lastAttempt !== undefined) {
        updateFields.push('last_attempt = ?');
        updateValues.push(JSON.stringify(reviewData.lastAttempt));
      }

      updateFields.push('updated_at = ?');
      updateValues.push(now);
      updateValues.push(reviewId);

      await db.execute({
        sql: `UPDATE grammar_reviews SET ${updateFields.join(', ')} WHERE review_id = ?`,
        args: updateValues,
      });
    } else {
      // Insert new review
      await db.execute({
        sql: `INSERT INTO grammar_reviews (
          review_id, user_id, sentence_id, rule_id, level,
          repetitions, ease_factor, interval, next_review_date,
          correct_count, incorrect_count, consecutive_correct, consecutive_incorrect,
          mastery_level, last_review_date, last_attempt, first_seen_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          reviewId,
          reviewData.userId,
          reviewData.sentenceId,
          reviewData.ruleId,
          reviewData.level,
          reviewData.repetitions || 0,
          reviewData.easeFactor || 2.5,
          reviewData.interval || 0,
          reviewData.nextReviewDate || now,
          reviewData.correctCount || 0,
          reviewData.incorrectCount || 0,
          reviewData.consecutiveCorrect || 0,
          reviewData.consecutiveIncorrect || 0,
          reviewData.masteryLevel || 0,
          reviewData.lastReviewDate || null,
          reviewData.lastAttempt ? JSON.stringify(reviewData.lastAttempt) : null,
          reviewData.firstSeenAt || now,
          now,
          now,
        ],
      });
    }
  } catch (error) {
    console.error('[grammarService:turso] Error saving grammar review:', error);
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
    const historyId = `${historyData.userId}_${historyData.sentenceId}_${historyData.timestamp}`;

    await db.execute({
      sql: `INSERT INTO grammar_review_history (
        history_id, user_id, sentence_id, rule_id,
        user_answer, correct_answer, is_correct, difficulty,
        mastery_before, mastery_after, interval_before, interval_after,
        response_time, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        historyId,
        historyData.userId,
        historyData.sentenceId,
        historyData.ruleId,
        historyData.userAnswer,
        historyData.correctAnswer,
        historyData.isCorrect ? 1 : 0,
        historyData.difficulty,
        historyData.masteryBefore,
        historyData.masteryAfter,
        historyData.intervalBefore,
        historyData.intervalAfter,
        historyData.responseTime || null,
        historyData.timestamp,
      ],
    });
  } catch (error) {
    console.error('[grammarService:turso] Error saving grammar review history:', error);
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
    const now = Date.now();

    // Check if rule exists
    const existing = await db.execute({
      sql: 'SELECT rule_id, created_at FROM grammar_rules WHERE rule_id = ? LIMIT 1',
      args: [ruleId],
    });

    const createdAt = existing.rows.length > 0 ? existing.rows[0].created_at : now;

    await db.execute({
      sql: `INSERT OR REPLACE INTO grammar_rules (
        rule_id, title, description, level, category, examples, explanation, "order", created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        ruleId,
        ruleData.title,
        ruleData.description,
        ruleData.level,
        ruleData.category,
        ruleData.examples ? JSON.stringify(ruleData.examples) : null,
        ruleData.explanation || null,
        ruleData.order || 0,
        createdAt,
        now,
      ],
    });
  } catch (error) {
    console.error('[grammarService:turso] Error saving grammar rule:', error);
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
    const now = Date.now();

    // Check if sentence exists
    const existing = await db.execute({
      sql: 'SELECT sentence_id, created_at FROM grammar_sentences WHERE sentence_id = ? LIMIT 1',
      args: [sentenceId],
    });

    const createdAt = existing.rows.length > 0 ? existing.rows[0].created_at : now;

    await db.execute({
      sql: `INSERT OR REPLACE INTO grammar_sentences (
        sentence_id, rule_id, english, german, level, hints, keywords, difficulty, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sentenceId,
        sentenceData.ruleId,
        sentenceData.english,
        sentenceData.german,
        sentenceData.level,
        sentenceData.hints ? JSON.stringify(sentenceData.hints) : null,
        sentenceData.keywords ? JSON.stringify(sentenceData.keywords) : null,
        sentenceData.difficulty || null,
        createdAt,
        now,
      ],
    });
  } catch (error) {
    console.error('[grammarService:turso] Error saving grammar sentence:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS - Row Mapping
// ============================================================================

function rowToGrammarRule(row: any): GrammarRule {
  return {
    ruleId: row.rule_id as string,
    title: row.title as string,
    description: row.description as string,
    level: row.level as CEFRLevel,
    category: row.category as string,
    examples: row.examples ? JSON.parse(row.examples as string) : undefined,
    explanation: row.explanation as string | undefined,
    order: row.order as number | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToGrammarSentence(row: any): GrammarSentence {
  return {
    sentenceId: row.sentence_id as string,
    ruleId: row.rule_id as string,
    english: row.english as string,
    german: row.german as string,
    level: row.level as CEFRLevel,
    hints: row.hints ? JSON.parse(row.hints as string) : undefined,
    keywords: row.keywords ? JSON.parse(row.keywords as string) : undefined,
    difficulty: row.difficulty as number | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToGrammarReview(row: any): GrammarReview {
  return {
    reviewId: row.review_id as string,
    userId: row.user_id as string,
    sentenceId: row.sentence_id as string,
    ruleId: row.rule_id as string,
    level: row.level as CEFRLevel,
    repetitions: row.repetitions as number,
    easeFactor: row.ease_factor as number,
    interval: row.interval as number,
    nextReviewDate: row.next_review_date as number,
    correctCount: row.correct_count as number,
    incorrectCount: row.incorrect_count as number,
    consecutiveCorrect: row.consecutive_correct as number,
    consecutiveIncorrect: row.consecutive_incorrect as number,
    lastReviewDate: row.last_review_date as number | null | undefined,
    masteryLevel: row.mastery_level as number,
    lastAttempt: row.last_attempt ? JSON.parse(row.last_attempt as string) : undefined,
    firstSeenAt: row.first_seen_at as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}
