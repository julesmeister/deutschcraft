/**
 * Student Service - Turso Implementation
 * Database abstraction layer for student-specific operations using Turso DB
 */

import { db } from '@/turso/client';
import { CEFRLevel } from '@/lib/models/cefr';

// ============================================================================
// STUDENT INITIALIZATION (Server-side)
// ============================================================================

/**
 * Initialize a new student record (server-side)
 * Creates both student and user records for a new user
 * @param email - Student's email
 * @param name - Student's name
 * @returns Student record with ID
 */
export async function initializeStudent(email: string, name?: string): Promise<{
  studentId: string;
  userId: string;
  targetLanguage: string;
  currentLevel: CEFRLevel;
  wordsLearned: number;
  wordsMastered: number;
  sentencesCreated: number;
  sentencesPerfect: number;
  currentStreak: number;
  longestStreak: number;
  totalPracticeTime: number;
  lastActiveDate: number;
  dailyGoal: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}> {
  try {
    // Check if student already exists
    const existingStudent = await db.execute({
      sql: "SELECT * FROM users WHERE user_id = ? AND role = 'STUDENT' LIMIT 1",
      args: [email],
    });

    if (existingStudent.rows.length > 0) {
      // Student already exists, return it
      const row = existingStudent.rows[0];
      return {
        studentId: row.user_id as string,
        userId: row.user_id as string,
        targetLanguage: 'German',
        currentLevel: (row.cefr_level as CEFRLevel) || CEFRLevel.A1,
        wordsLearned: Number(row.words_learned) || 0,
        wordsMastered: Number(row.words_mastered) || 0,
        sentencesCreated: Number(row.sentences_created) || 0,
        sentencesPerfect: Number(row.sentences_perfect) || 0,
        currentStreak: Number(row.current_streak) || 0,
        longestStreak: Number(row.longest_streak) || 0,
        totalPracticeTime: Number(row.total_practice_time) || 0,
        lastActiveDate: Number(row.last_active_date) || Date.now(),
        dailyGoal: Number(row.daily_goal) || 20,
        notificationsEnabled: Boolean(row.notifications_enabled),
        soundEnabled: Boolean(row.sound_enabled),
        createdAt: Number(row.created_at),
        updatedAt: Number(row.updated_at),
      };
    }

    // Create new student record with default values
    const now = Date.now();
    const firstName = name?.split(' ')[0] || 'Student';
    const lastName = name?.split(' ').slice(1).join(' ') || '';

    await db.execute({
      sql: `INSERT INTO users (
        user_id, email, first_name, last_name, role,
        cefr_level, words_learned, words_mastered, sentences_created, sentences_perfect,
        current_streak, longest_streak, total_practice_time, last_active_date,
        daily_goal, notifications_enabled, sound_enabled,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        email,
        email,
        firstName,
        lastName,
        'STUDENT',
        CEFRLevel.A1, // Start at beginner level
        0, // words_learned
        0, // words_mastered
        0, // sentences_created
        0, // sentences_perfect
        0, // current_streak
        0, // longest_streak
        0, // total_practice_time
        now, // last_active_date
        20, // daily_goal (20 words per day default)
        1, // notifications_enabled (true)
        1, // sound_enabled (true)
        now,
        now,
      ],
    });

    return {
      studentId: email,
      userId: email,
      targetLanguage: 'German',
      currentLevel: CEFRLevel.A1,
      wordsLearned: 0,
      wordsMastered: 0,
      sentencesCreated: 0,
      sentencesPerfect: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPracticeTime: 0,
      lastActiveDate: now,
      dailyGoal: 20,
      notificationsEnabled: true,
      soundEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error('[studentService:turso] Error initializing student:', error);
    throw error;
  }
}

// ============================================================================
// STUDENT MANAGEMENT OPERATIONS
// ============================================================================

/**
 * Assign multiple students to a batch and teacher
 * @param studentEmails - Array of student emails
 * @param teacherId - Teacher's email
 * @param batchId - Batch ID to assign to
 */
export async function assignStudentsToBatch(
  studentEmails: string[],
  teacherId: string,
  batchId: string
): Promise<void> {
  try {
    // Use transaction for atomic updates
    const statements = studentEmails.map((email) => ({
      sql: 'UPDATE users SET teacher_id = ?, batch_id = ?, updated_at = ? WHERE user_id = ?',
      args: [teacherId, batchId, Date.now(), email],
    }));

    await db.batch(statements);
  } catch (error) {
    console.error('[studentService:turso] Error assigning students to batch:', error);
    throw error;
  }
}

/**
 * Remove student from teacher and batch
 * @param studentEmail - Student's email
 */
export async function removeStudentFromTeacher(studentEmail: string): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET teacher_id = NULL, batch_id = NULL, updated_at = ? WHERE user_id = ?',
      args: [Date.now(), studentEmail],
    });
  } catch (error) {
    console.error('[studentService:turso] Error removing student from teacher:', error);
    throw error;
  }
}

/**
 * Update student's CEFR level
 * @param studentEmail - Student's email
 * @param cefrLevel - New CEFR level (A1-C2)
 */
export async function updateStudentLevel(
  studentEmail: string,
  cefrLevel: string
): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET cefr_level = ?, updated_at = ? WHERE user_id = ?',
      args: [cefrLevel, Date.now(), studentEmail],
    });
  } catch (error) {
    console.error('[studentService:turso] Error updating student level:', error);
    throw error;
  }
}
