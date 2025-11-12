/**
 * Session Service - Turso Implementation
 * Database abstraction layer for session operations using Turso DB
 */

import { db } from '@/turso/client';

export interface Session {
  sessionId: string;
  userId: string;
  sessionType: 'flashcard' | 'writing' | 'translation' | 'grammar';
  sessionData: any;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: number;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM sessions WHERE session_id = ? LIMIT 1',
      args: [sessionId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToSession(result.rows[0]);
  } catch (error) {
    console.error('[sessionService:turso] Error fetching session:', error);
    throw error;
  }
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(
  userId: string,
  limit: number = 30
): Promise<Session[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?',
      args: [userId, limit],
    });

    return result.rows.map(rowToSession);
  } catch (error) {
    console.error('[sessionService:turso] Error fetching user sessions:', error);
    throw error;
  }
}

/**
 * Get recent sessions (paginated)
 */
export async function getRecentSessions(
  userId: string,
  offset: number = 0,
  limit: number = 8
): Promise<{ sessions: Session[]; total: number; hasMore: boolean }> {
  try {
    // Get total count
    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
      args: [userId],
    });
    const total = (countResult.rows[0].count as number) || 0;

    // Get paginated sessions
    const result = await db.execute({
      sql: 'SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?',
      args: [userId, limit, offset],
    });

    const sessions = result.rows.map(rowToSession);
    const hasMore = offset + sessions.length < total;

    return { sessions, total, hasMore };
  } catch (error) {
    console.error('[sessionService:turso] Error fetching recent sessions:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  sessionType: Session['sessionType'],
  sessionData?: any
): Promise<string> {
  try {
    const sessionId = `SESSION_${Date.now()}_${userId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO sessions (
              session_id, user_id, session_type, session_data,
              started_at, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sessionId,
        userId,
        sessionType,
        sessionData ? JSON.stringify(sessionData) : null,
        now,
        'active',
        now,
      ],
    });

    return sessionId;
  } catch (error) {
    console.error('[sessionService:turso] Error creating session:', error);
    throw error;
  }
}

/**
 * Complete a session
 */
export async function completeSession(
  sessionId: string,
  sessionData?: any
): Promise<void> {
  try {
    const now = Date.now();

    // Get the session to calculate duration
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const duration = Math.floor((now - session.startedAt) / 1000); // seconds

    await db.execute({
      sql: `UPDATE sessions
            SET status = ?, completed_at = ?, duration = ?, session_data = ?
            WHERE session_id = ?`,
      args: [
        'completed',
        now,
        duration,
        sessionData ? JSON.stringify(sessionData) : session.sessionData,
        sessionId,
      ],
    });
  } catch (error) {
    console.error('[sessionService:turso] Error completing session:', error);
    throw error;
  }
}

/**
 * Abandon a session
 */
export async function abandonSession(sessionId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE sessions SET status = ? WHERE session_id = ?',
      args: ['abandoned', sessionId],
    });
  } catch (error) {
    console.error('[sessionService:turso] Error abandoning session:', error);
    throw error;
  }
}

/**
 * Update session data
 */
export async function updateSessionData(
  sessionId: string,
  sessionData: any
): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE sessions SET session_data = ? WHERE session_id = ?',
      args: [JSON.stringify(sessionData), sessionId],
    });
  } catch (error) {
    console.error('[sessionService:turso] Error updating session data:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToSession(row: any): Session {
  return {
    sessionId: row.session_id as string,
    userId: row.user_id as string,
    sessionType: row.session_type as Session['sessionType'],
    sessionData: row.session_data ? JSON.parse(row.session_data as string) : null,
    startedAt: row.started_at as number,
    completedAt: row.completed_at as number | undefined,
    duration: row.duration as number | undefined,
    status: row.status as Session['status'],
    createdAt: row.created_at as number,
  };
}
