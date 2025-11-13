/**
 * Teacher Analytics
 * Functions for aggregating writing statistics for teacher dashboards
 */

import { db } from '@/turso/client';

/**
 * Get aggregate statistics for all students (teacher view)
 */
export async function getTeacherWritingStats(teacherId: string): Promise<{
  totalSubmissions: number;
  averageScore: number;
  totalWordsWritten: number;
  submissionsThisWeek: number;
}> {
  try {
    // Get all students for this teacher
    const studentsResult = await db.execute({
      sql: 'SELECT user_id FROM users WHERE teacher_id = ? AND role = ?',
      args: [teacherId, 'STUDENT'],
    });

    if (studentsResult.rows.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        totalWordsWritten: 0,
        submissionsThisWeek: 0,
      };
    }

    const studentIds = studentsResult.rows.map(row => row.user_id as string);

    // Get aggregate stats
    const placeholders = studentIds.map(() => '?').join(',');

    const submissionsResult = await db.execute({
      sql: `SELECT
              COUNT(*) as total_submissions,
              AVG(teacher_score) as average_score,
              SUM(COALESCE(word_count, 0)) as total_words
            FROM writing_submissions
            WHERE user_id IN (${placeholders})
              AND status = 'reviewed'`,
      args: studentIds,
    });

    // Get submissions this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoTimestamp = weekAgo.getTime();

    const weekResult = await db.execute({
      sql: `SELECT COUNT(*) as count
            FROM writing_submissions
            WHERE user_id IN (${placeholders})
              AND submitted_at >= ?`,
      args: [...studentIds, weekAgoTimestamp],
    });

    const stats = submissionsResult.rows[0];
    return {
      totalSubmissions: Number(stats.total_submissions) || 0,
      averageScore: Math.round(Number(stats.average_score) || 0),
      totalWordsWritten: Number(stats.total_words) || 0,
      submissionsThisWeek: Number(weekResult.rows[0].count) || 0,
    };
  } catch (error) {
    console.error('[writingProgressService:turso] Error getting teacher writing stats:', error);
    return {
      totalSubmissions: 0,
      averageScore: 0,
      totalWordsWritten: 0,
      submissionsThisWeek: 0,
    };
  }
}
