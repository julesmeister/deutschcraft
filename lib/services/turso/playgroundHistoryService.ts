/**
 * Playground History Service - Turso Implementation
 * Database abstraction layer for playground room history and statistics
 */

import { db } from '@/turso/client';

export interface PlaygroundHistoryRecord {
  historyId: string;
  roomId: string;
  roomTitle: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  endedAt: number;
  durationMinutes: number;
  totalParticipants: number;
  maxConcurrentParticipants: number;
  totalMessages: number;
  totalWordsWritten: number;
  voiceActiveDuration: number;
  participantList: string[];
  tags: string[];
  loggedAt: number;
}

export interface PlaygroundHistoryStats {
  totalRooms: number;
  totalDuration: number;
  totalParticipants: number;
  averageParticipants: number;
  averageDuration: number;
  mostRecentRoom?: Date;
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Log a room to history when it ends
 */
export async function logPlaygroundRoomHistory(
  data: Omit<PlaygroundHistoryRecord, 'historyId' | 'loggedAt'>
): Promise<string> {
  try {
    const historyId = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.execute({
      sql: `INSERT INTO playground_history (
        history_id, room_id, room_title, host_id, host_name,
        created_at, ended_at, duration_minutes,
        total_participants, max_concurrent_participants,
        total_messages, total_words_written, voice_active_duration,
        participant_list, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        historyId,
        data.roomId,
        data.roomTitle,
        data.hostId,
        data.hostName,
        data.createdAt,
        data.endedAt,
        data.durationMinutes,
        data.totalParticipants,
        data.maxConcurrentParticipants,
        data.totalMessages,
        data.totalWordsWritten,
        data.voiceActiveDuration,
        JSON.stringify(data.participantList),
        JSON.stringify([]), // Empty tags by default
      ],
    });

    return historyId;
  } catch (error) {
    console.error('[playgroundHistoryService] Error logging room history:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get room history for a specific host
 */
export async function getRoomHistory(
  hostId: string,
  limit: number = 20
): Promise<PlaygroundHistoryRecord[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM playground_history
            WHERE host_id = ?
            ORDER BY created_at DESC
            LIMIT ?`,
      args: [hostId, limit],
    });

    return result.rows.map((row) => ({
      historyId: row.history_id as string,
      roomId: row.room_id as string,
      roomTitle: row.room_title as string,
      hostId: row.host_id as string,
      hostName: row.host_name as string,
      createdAt: row.created_at as number,
      endedAt: row.ended_at as number,
      durationMinutes: row.duration_minutes as number,
      totalParticipants: row.total_participants as number,
      maxConcurrentParticipants: row.max_concurrent_participants as number,
      totalMessages: row.total_messages as number,
      totalWordsWritten: row.total_words_written as number,
      voiceActiveDuration: (row.voice_active_duration as number) || 0,
      participantList: JSON.parse((row.participant_list as string) || '[]'),
      tags: JSON.parse((row.tags as string) || '[]'),
      loggedAt: row.logged_at as number,
    }));
  } catch (error) {
    console.error('[playgroundHistoryService] Error fetching room history:', error);
    throw error;
  }
}

/**
 * Get aggregated statistics for a host
 */
export async function getPlaygroundHistoryStats(
  hostId: string
): Promise<PlaygroundHistoryStats> {
  try {
    const result = await db.execute({
      sql: `SELECT
              COUNT(*) as total_rooms,
              SUM(duration_minutes) as total_duration,
              SUM(total_participants) as total_participants,
              AVG(total_participants) as avg_participants,
              AVG(duration_minutes) as avg_duration,
              MAX(created_at) as most_recent
            FROM playground_history
            WHERE host_id = ?`,
      args: [hostId],
    });

    const row = result.rows[0];

    return {
      totalRooms: (row.total_rooms as number) || 0,
      totalDuration: (row.total_duration as number) || 0,
      totalParticipants: (row.total_participants as number) || 0,
      averageParticipants: Math.round((row.avg_participants as number) || 0),
      averageDuration: Math.round((row.avg_duration as number) || 0),
      mostRecentRoom: row.most_recent
        ? new Date(row.most_recent as number)
        : undefined,
    };
  } catch (error) {
    console.error('[playgroundHistoryService] Error fetching history stats:', error);
    throw error;
  }
}

/**
 * Get a single history record by ID
 */
export async function getHistoryRecord(
  historyId: string
): Promise<PlaygroundHistoryRecord | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM playground_history WHERE history_id = ? LIMIT 1',
      args: [historyId],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      historyId: row.history_id as string,
      roomId: row.room_id as string,
      roomTitle: row.room_title as string,
      hostId: row.host_id as string,
      hostName: row.host_name as string,
      createdAt: row.created_at as number,
      endedAt: row.ended_at as number,
      durationMinutes: row.duration_minutes as number,
      totalParticipants: row.total_participants as number,
      maxConcurrentParticipants: row.max_concurrent_participants as number,
      totalMessages: row.total_messages as number,
      totalWordsWritten: row.total_words_written as number,
      voiceActiveDuration: (row.voice_active_duration as number) || 0,
      participantList: JSON.parse((row.participant_list as string) || '[]'),
      tags: JSON.parse((row.tags as string) || '[]'),
      loggedAt: row.logged_at as number,
    };
  } catch (error) {
    console.error('[playgroundHistoryService] Error fetching history record:', error);
    throw error;
  }
}

/**
 * Update tags for a history record
 */
export async function updateHistoryTags(
  historyId: string,
  tags: string[]
): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE playground_history SET tags = ? WHERE history_id = ?',
      args: [JSON.stringify(tags), historyId],
    });
  } catch (error) {
    console.error('[playgroundHistoryService] Error updating tags:', error);
    throw error;
  }
}
