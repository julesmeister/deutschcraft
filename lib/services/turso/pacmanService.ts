/**
 * Pacman Verb Progress Service - Turso Implementation
 * Tracks how many times a user correctly answered each verb in the prefix game
 */

import { db } from '@/turso/client';

export interface PacmanVerbProgress {
  id: string;
  userId: string;
  verbFull: string;
  verbRoot: string;
  verbPrefix: string;
  meaning: string;
  correctCount: number;
  lastCorrectAt: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * Save or increment a correct answer for a verb
 */
export async function savePacmanVerbCorrect(
  userId: string,
  verb: { full: string; root: string; prefix: string; meaning: string }
): Promise<number> {
  const id = `${userId}_${verb.full}`;
  const now = Date.now();

  await db.execute({
    sql: `INSERT INTO pacman_verb_progress (
            id, user_id, verb_full, verb_root, verb_prefix, meaning,
            correct_count, last_correct_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            correct_count = correct_count + 1,
            last_correct_at = excluded.last_correct_at`,
    args: [id, userId, verb.full, verb.root, verb.prefix, verb.meaning, now, now, now],
  });

  // Return the new count
  const result = await db.execute({
    sql: `SELECT correct_count FROM pacman_verb_progress WHERE id = ?`,
    args: [id],
  });

  return (result.rows[0]?.correct_count as number) || 1;
}

/**
 * Get all verb progress for a user
 */
export async function getPacmanVerbProgress(
  userId: string
): Promise<PacmanVerbProgress[]> {
  const result = await db.execute({
    sql: `SELECT * FROM pacman_verb_progress WHERE user_id = ? ORDER BY correct_count DESC`,
    args: [userId],
  });

  return result.rows.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    verbFull: row.verb_full as string,
    verbRoot: row.verb_root as string,
    verbPrefix: row.verb_prefix as string,
    meaning: row.meaning as string,
    correctCount: row.correct_count as number,
    lastCorrectAt: row.last_correct_at as number | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));
}
