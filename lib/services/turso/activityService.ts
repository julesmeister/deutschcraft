/**
 * Activity Service - Turso Implementation
 * Handles tracking and retrieving student activities
 */

import { db } from '@/turso/client';
import { Activity, ActivityType } from '@/lib/models/activity';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToActivity(row: any): Activity {
  return {
    activityId: row.activity_id as string,
    studentEmail: row.student_email as string,
    studentName: row.student_name as string | undefined,
    type: row.type as ActivityType,
    timestamp: new Date(row.timestamp as number),
    metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined,
  };
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

export async function logActivity(
  activity: Omit<Activity, 'activityId' | 'timestamp'>
): Promise<string> {
  try {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO activities (
              activity_id, student_email, student_name, type, timestamp, metadata
            ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        activityId,
        activity.studentEmail,
        activity.studentName || null,
        activity.type,
        now,
        activity.metadata ? JSON.stringify(activity.metadata) : null,
      ],
    });

    return activityId;
  } catch (error) {
    console.error('[activityService:turso] Error logging activity:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getRecentActivities(limitCount: number = 20): Promise<Activity[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM activities
            ORDER BY timestamp DESC
            LIMIT ?`,
      args: [limitCount],
    });

    return result.rows.map(rowToActivity);
  } catch (error) {
    console.error('[activityService:turso] Error fetching recent activities:', error);
    return [];
  }
}

export async function getStudentActivities(
  studentEmail: string,
  limitCount: number = 50
): Promise<Activity[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM activities
            WHERE student_email = ?
            ORDER BY timestamp DESC
            LIMIT ?`,
      args: [studentEmail, limitCount],
    });

    return result.rows.map(rowToActivity);
  } catch (error) {
    console.error('[activityService:turso] Error fetching student activities:', error);
    return [];
  }
}

export async function getActivityCountByType(
  studentEmail?: string
): Promise<Record<ActivityType, number>> {
  try {
    let sql = 'SELECT type, COUNT(*) as count FROM activities';
    const args: any[] = [];

    if (studentEmail) {
      sql += ' WHERE student_email = ?';
      args.push(studentEmail);
    }

    sql += ' GROUP BY type';

    const result = await db.execute({ sql, args });

    const counts: Record<ActivityType, number> = {
      [ActivityType.FLASHCARD_CREATED]: 0,
      [ActivityType.FLASHCARD_REVIEWED]: 0,
      [ActivityType.WRITING_SUBMITTED]: 0,
      [ActivityType.WRITING_REVIEWED]: 0,
      [ActivityType.LEVEL_CHANGED]: 0,
      [ActivityType.STREAK_MILESTONE]: 0,
      [ActivityType.LOGIN]: 0,
      [ActivityType.PRACTICE_SESSION]: 0,
    };

    result.rows.forEach(row => {
      const type = row.type as ActivityType;
      if (type in counts) {
        counts[type] = row.count as number;
      }
    });

    return counts;
  } catch (error) {
    console.error('[activityService:turso] Error fetching activity counts:', error);
    return {
      [ActivityType.FLASHCARD_CREATED]: 0,
      [ActivityType.FLASHCARD_REVIEWED]: 0,
      [ActivityType.WRITING_SUBMITTED]: 0,
      [ActivityType.WRITING_REVIEWED]: 0,
      [ActivityType.LEVEL_CHANGED]: 0,
      [ActivityType.STREAK_MILESTONE]: 0,
      [ActivityType.LOGIN]: 0,
      [ActivityType.PRACTICE_SESSION]: 0,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR LOGGING SPECIFIC ACTIVITIES
// ============================================================================

export async function logFlashcardCreated(
  studentEmail: string,
  studentName: string,
  flashcardId: string,
  wordCount: number = 1
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.FLASHCARD_CREATED,
    metadata: {
      flashcardId,
      wordCount,
      description: `Created ${wordCount} flashcard${wordCount > 1 ? 's' : ''}`,
    },
  });
}

export async function logFlashcardReviewed(
  studentEmail: string,
  studentName: string,
  flashcardId: string
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.FLASHCARD_REVIEWED,
    metadata: {
      flashcardId,
      description: 'Reviewed flashcard',
    },
  });
}

export async function logWritingSubmitted(
  studentEmail: string,
  studentName: string,
  writingType: string,
  wordLength: number
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.WRITING_SUBMITTED,
    metadata: {
      writingType,
      wordLength,
      description: `Submitted ${writingType} (${wordLength} words)`,
    },
  });
}

export async function logLevelChange(
  studentEmail: string,
  studentName: string,
  oldLevel: string,
  newLevel: string
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.LEVEL_CHANGED,
    metadata: {
      oldLevel,
      newLevel,
      description: `Level changed from ${oldLevel} to ${newLevel}`,
    },
  });
}

export async function logStreakMilestone(
  studentEmail: string,
  studentName: string,
  streakDays: number
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.STREAK_MILESTONE,
    metadata: {
      streakDays,
      description: `Reached ${streakDays}-day streak! 🔥`,
    },
  });
}

export async function logLogin(studentEmail: string, studentName: string) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.LOGIN,
    metadata: {
      description: 'Logged in',
    },
  });
}

export async function logPracticeSession(
  studentEmail: string,
  studentName: string,
  durationMinutes: number
) {
  return logActivity({
    studentEmail,
    studentName,
    type: ActivityType.PRACTICE_SESSION,
    metadata: {
      description: `Completed ${durationMinutes}-minute practice session`,
    },
  });
}
