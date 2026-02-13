/**
 * Der Die Das Progress Service - Turso Implementation
 * Tracks how many times a user correctly matched each noun ending in the gender game
 */

import { db } from '@/turso/client';

export interface DerDieDasProgress {
  id: string;
  userId: string;
  ending: string;
  correctArticle: string;
  correctCount: number;
  lastCorrectAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Save or increment a correct answer for an ending
 */
export async function saveDerDieDasCorrect(
  userId: string,
  entry: { ending: string; article: string }
): Promise<number> {
  const id = `${userId}_${entry.ending}`;
  const now = Date.now();

  await db.execute({
    sql: `INSERT INTO derdiedas_progress (
            id, user_id, ending, correct_article,
            correct_count, last_correct_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            correct_count = correct_count + 1,
            last_correct_at = excluded.last_correct_at`,
    args: [id, userId, entry.ending, entry.article, now, now, now],
  });

  const result = await db.execute({
    sql: `SELECT correct_count FROM derdiedas_progress WHERE id = ?`,
    args: [id],
  });

  return (result.rows[0]?.correct_count as number) || 1;
}

/**
 * Get all ending progress for a user
 */
export async function getDerDieDasProgress(
  userId: string
): Promise<DerDieDasProgress[]> {
  const result = await db.execute({
    sql: `SELECT * FROM derdiedas_progress WHERE user_id = ? ORDER BY correct_count DESC`,
    args: [userId],
  });

  return result.rows.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    ending: row.ending as string,
    correctArticle: row.correct_article as string,
    correctCount: row.correct_count as number,
    lastCorrectAt: row.last_correct_at as number | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));
}
