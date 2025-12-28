/**
 * Student Service - Database abstraction layer for student-specific operations
 *
 * This service handles student management operations like assignment and removal.
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { db } from '../../firebase';
import { doc, updateDoc, collection, query, where, limit, getDocs, addDoc, setDoc } from 'firebase/firestore';
import { CEFRLevel } from '../../models/cefr';

// ============================================================================
// STUDENT INITIALIZATION
// ============================================================================

/**
 * Initialize a new student record
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
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('userId', '==', email), limit(1));
    const existingStudents = await getDocs(q);

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
    const docRef = await addDoc(collection(db, 'students'), newStudent);

    // Create/update user record
    await setDoc(doc(db, 'users', email), {
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
    console.error('[studentService] Error initializing student:', error);
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
    const updatePromises = studentEmails.map(async (email) => {
      const userRef = doc(db, 'users', email);
      await updateDoc(userRef, {
        teacherId,
        batchId,
        updatedAt: Date.now(),
      });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('[studentService] Error assigning students to batch:', error);
    throw error;
  }
}

/**
 * Remove student from teacher and batch
 * @param studentEmail - Student's email
 */
export async function removeStudentFromTeacher(studentEmail: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', studentEmail);
    await updateDoc(userRef, {
      teacherId: null,
      batchId: null,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[studentService] Error removing student from teacher:', error);
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
    const userRef = doc(db, 'users', studentEmail);
    await updateDoc(userRef, {
      cefrLevel,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[studentService] Error updating student level:', error);
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function assignStudentsToBatch(
  studentEmails: string[],
  teacherId: string,
  batchId: string
): Promise<void> {
  // Use SQL transaction for atomic updates
  await sql`
    UPDATE users
    SET teacher_id = ${teacherId},
        batch_id = ${batchId},
        updated_at = NOW()
    WHERE email = ANY(${studentEmails})
  `;
}

export async function removeStudentFromTeacher(studentEmail: string): Promise<void> {
  await sql`
    UPDATE users
    SET teacher_id = NULL,
        batch_id = NULL,
        updated_at = NOW()
    WHERE email = ${studentEmail}
  `;
}

export async function updateStudentLevel(
  studentEmail: string,
  cefrLevel: string
): Promise<void> {
  await sql`
    UPDATE users
    SET cefr_level = ${cefrLevel},
        updated_at = NOW()
    WHERE email = ${studentEmail}
  `;
}
*/
