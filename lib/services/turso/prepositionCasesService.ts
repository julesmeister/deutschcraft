/**
 * Preposition Cases Progress Service - Turso Implementation
 * Tracks how many times a user correctly matched each preposition's case in the game
 */

import { db } from '@/turso/client';

export interface PrepositionCasesProgress {
  id: string;
  userId: string;
  preposition: string;
  correctCase: string;
  correctCount: number;
  lastCorrectAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Save or increment a correct answer for a preposition
 */
export async function savePrepositionCaseCorrect(
  userId: string,
  entry: { german: string; case: string }
): Promise<number> {
  const id = `${userId}_${entry.german}`;
  const now = Date.now();

  await db.execute({
    sql: `INSERT INTO preposition_cases_progress (
            id, user_id, preposition, correct_case,
            correct_count, last_correct_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            correct_count = correct_count + 1,
            last_correct_at = excluded.last_correct_at`,
    args: [id, userId, entry.german, entry.case, now, now, now],
  });

  const result = await db.execute({
    sql: `SELECT correct_count FROM preposition_cases_progress WHERE id = ?`,
    args: [id],
  });

  return (result.rows[0]?.correct_count as number) || 1;
}

/**
 * Get all preposition progress for a user
 */
export async function getPrepositionCasesProgress(
  userId: string
): Promise<PrepositionCasesProgress[]> {
  const result = await db.execute({
    sql: `SELECT * FROM preposition_cases_progress WHERE user_id = ? ORDER BY correct_count DESC`,
    args: [userId],
  });

  return result.rows.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    preposition: row.preposition as string,
    correctCase: row.correct_case as string,
    correctCount: row.correct_count as number,
    lastCorrectAt: row.last_correct_at as number | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));
}
