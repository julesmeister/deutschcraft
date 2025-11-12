/**
 * Student Service (Admin SDK) - Database abstraction for server-side operations
 *
 * This service handles student operations using Firebase Admin SDK (for API routes).
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firebase Admin operations are isolated here
 * - API routes call these functions instead of using Firebase Admin directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { adminDb } from '../firebase-admin';
import { CEFRLevel } from '../models/cefr';

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
    const existingStudents = await adminDb
      .collection('students')
      .where('userId', '==', email)
      .limit(1)
      .get();

    if (!existingStudents.empty) {
      // Student already exists, return it
      const doc = existingStudents.docs[0];
      return {
        studentId: doc.id,
        ...doc.data(),
      } as any;
    }

    // Create new student record with default values
    const now = Date.now();
    const newStudent = {
      userId: email,
      targetLanguage: 'German',
      currentLevel: CEFRLevel.A1, // Start at beginner level

      // Learning Statistics (all start at 0)
      wordsLearned: 0,
      wordsMastered: 0,
      sentencesCreated: 0,
      sentencesPerfect: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPracticeTime: 0,
      lastActiveDate: now,

      // Settings (default values)
      dailyGoal: 20, // 20 words per day default
      notificationsEnabled: true,
      soundEnabled: true,

      createdAt: now,
      updatedAt: now,
    };

    // Add student record
    const docRef = await adminDb.collection('students').add(newStudent);

    // Create/update user record
    await adminDb.collection('users').doc(email).set({
      email,
      name: name || 'Student',
      role: 'student',
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    return {
      studentId: docRef.id,
      ...newStudent,
    };
  } catch (error) {
    console.error('[studentService.admin] Error initializing student:', error);
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function initializeStudent(email: string, name?: string): Promise<any> {
  try {
    // Check if student already exists
    const existingStudent = await sql`
      SELECT * FROM students
      WHERE user_id = ${email}
      LIMIT 1
    `;

    if (existingStudent.rows.length > 0) {
      return {
        studentId: existingStudent.rows[0].id,
        ...existingStudent.rows[0],
      };
    }

    // Create new student record
    const now = Date.now();
    const studentResult = await sql`
      INSERT INTO students (
        user_id, target_language, current_level,
        words_learned, words_mastered, sentences_created, sentences_perfect,
        current_streak, longest_streak, total_practice_time, last_active_date,
        daily_goal, notifications_enabled, sound_enabled,
        created_at, updated_at
      )
      VALUES (
        ${email}, 'German', 'A1',
        0, 0, 0, 0,
        0, 0, 0, ${now},
        20, true, true,
        ${now}, ${now}
      )
      RETURNING id, *
    `;

    // Create/update user record
    await sql`
      INSERT INTO users (email, name, role, created_at, updated_at)
      VALUES (${email}, ${name || 'Student'}, 'student', ${now}, ${now})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = EXCLUDED.updated_at
    `;

    return {
      studentId: studentResult.rows[0].id,
      ...studentResult.rows[0],
    };
  } catch (error) {
    console.error('[studentService.admin] Error initializing student:', error);
    throw error;
  }
}
*/
