/**
 * Classroom Tools Service - Turso Implementation
 * Persists classroom tool state (dice, timer, scoreboard, etc.) per room
 */

import { db } from '@/turso/client';

export interface ClassroomToolState {
  [toolKey: string]: unknown;
}

export async function getToolState(roomId: string): Promise<{ state: ClassroomToolState; updatedAt: number } | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT tool_state, updated_at FROM classroom_tools WHERE room_id = ? LIMIT 1',
      args: [roomId],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      state: JSON.parse((row.tool_state as string) || '{}'),
      updatedAt: row.updated_at as number,
    };
  } catch (error) {
    console.error('[classroomToolsService] Error getting tool state:', error);
    throw error;
  }
}

export async function upsertToolState(
  roomId: string,
  state: ClassroomToolState,
  updatedBy: string
): Promise<void> {
  try {
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO classroom_tools (room_id, tool_state, updated_at, updated_by)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(room_id) DO UPDATE SET
              tool_state = excluded.tool_state,
              updated_at = excluded.updated_at,
              updated_by = excluded.updated_by`,
      args: [roomId, JSON.stringify(state), now, updatedBy],
    });
  } catch (error) {
    console.error('[classroomToolsService] Error upserting tool state:', error);
    throw error;
  }
}

export async function getToolStateIfChanged(
  roomId: string,
  sinceTimestamp: number
): Promise<{ state: ClassroomToolState; updatedAt: number } | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT tool_state, updated_at FROM classroom_tools WHERE room_id = ? AND updated_at > ? LIMIT 1',
      args: [roomId, sinceTimestamp],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      state: JSON.parse((row.tool_state as string) || '{}'),
      updatedAt: row.updated_at as number,
    };
  } catch (error) {
    console.error('[classroomToolsService] Error checking tool state changes:', error);
    throw error;
  }
}
