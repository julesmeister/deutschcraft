/**
 * User and Batch Models
 * FLAT STRUCTURE - Top-level collections only
 *
 * Collections:
 * - users/{email}
 * - batches/{batchId}
 */

import { CEFRLevel } from './cefr';

/**
 * User Model
 * Path: users/{email}
 * ONE document per person - email is the document ID
 */
export interface User {
  // Primary Key (document ID)
  userId: string; // Email address (same as document ID)
  email: string; // Email address (same as userId)

  // Basic Info
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER';
  photoURL?: string;

  // Student-specific fields (only if role === 'STUDENT')
  cefrLevel?: CEFRLevel;
  teacherId?: string | null; // Email of teacher
  batchId?: string | null; // Reference to batch

  // Student learning stats
  wordsLearned?: number;
  wordsMastered?: number;
  sentencesCreated?: number;
  sentencesPerfect?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalPracticeTime?: number; // minutes
  dailyGoal?: number; // words per day
  lastActiveDate?: number | null;

  // Student settings
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;

  // Flashcard settings
  flashcardSettings?: {
    cardsPerSession: number; // -1 means unlimited
    autoPlayAudio: boolean;
    showExamples: boolean;
    randomizeOrder: boolean;
  };

  // Teacher-specific fields (only if role === 'TEACHER')
  totalStudents?: number; // Computed
  activeBatches?: number; // Computed

  // Common
  createdAt: number;
  updatedAt: number;
}

/**
 * Batch Model
 * Path: batches/{batchId}
 * Top-level collection
 */
export interface Batch {
  batchId: string;
  teacherId: string; // Email of teacher who created it

  name: string;
  description?: string;
  currentLevel: CEFRLevel;

  isActive: boolean;
  startDate: number;
  endDate: number | null;

  studentCount: number; // Computed field

  // Level progression history
  levelHistory: BatchLevelHistory[];

  createdAt: number;
  updatedAt: number;
}

export interface BatchLevelHistory {
  level: CEFRLevel;
  startDate: number;
  endDate: number | null;
  modifiedBy: string; // teacherId (email)
  notes?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get user's full name
 */
export function getUserFullName(user: User): string {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.email || 'Unknown User';
}

/**
 * Calculate student success rate
 */
export function getStudentSuccessRate(user: User): number {
  if (!user.sentencesCreated || user.sentencesCreated === 0) return 0;
  const perfect = user.sentencesPerfect || 0;
  return (perfect / user.sentencesCreated) * 100;
}

/**
 * Check if user is a student
 */
export function isStudent(user: User): boolean {
  return user.role === 'STUDENT';
}

/**
 * Check if user is a teacher
 */
export function isTeacher(user: User): boolean {
  return user.role === 'TEACHER';
}

// Legacy exports for backwards compatibility
export type Student = User;
export type Teacher = User;
export type StudentData = User;
