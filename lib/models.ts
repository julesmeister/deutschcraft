/**
 * Data Models for Testmanship Web V2
 * FLAT STRUCTURE - Top-level collections only
 *
 * Collections:
 * - users/{email}
 * - batches/{batchId}
 * - tasks/{taskId}
 * - submissions/{submissionId}
 * - progress/{progressId}
 */

// CEFR Language Levels (A1-C2)
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export const CEFRLevelInfo = {
  [CEFRLevel.A1]: {
    displayName: 'A1 - Beginner',
    description: 'Simple everyday phrases',
  },
  [CEFRLevel.A2]: {
    displayName: 'A2 - Elementary',
    description: 'Basic conversations',
  },
  [CEFRLevel.B1]: {
    displayName: 'B1 - Intermediate',
    description: 'Clear standard language',
  },
  [CEFRLevel.B2]: {
    displayName: 'B2 - Upper Intermediate',
    description: 'Complex texts and topics',
  },
  [CEFRLevel.C1]: {
    displayName: 'C1 - Advanced',
    description: 'Flexible and effective language',
  },
  [CEFRLevel.C2]: {
    displayName: 'C2 - Mastery',
    description: 'Near-native proficiency',
  },
} as const;

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

/**
 * Writing Task Model
 * Path: tasks/{taskId}
 * Top-level collection
 */
export interface WritingTask {
  taskId: string;
  batchId: string; // Which batch this task belongs to
  teacherId: string; // Email of teacher who created it

  // Task details
  title: string;
  description?: string;
  instructions: string;

  // Classification
  category: 'essay' | 'letter' | 'email' | 'story' | 'article' | 'report' | 'review' | 'other';
  level: CEFRLevel;

  // Status and priority
  status: 'draft' | 'assigned' | 'completed';
  priority: 'low' | 'medium' | 'high';

  // Timing
  assignedDate: number | null;
  dueDate: number;
  estimatedDuration?: number; // minutes

  // Assignment
  assignedStudents: string[]; // Array of student emails
  completedStudents: string[]; // Array of student emails who completed

  // Requirements
  minWords?: number;
  maxWords?: number;
  requiredVocabulary?: string[];
  totalPoints?: number;

  createdAt: number;
  updatedAt: number;
}

/**
 * Task Submission Model
 * Path: submissions/{submissionId}
 * Top-level collection
 */
export interface TaskSubmission {
  submissionId: string;
  taskId: string; // Reference to task
  studentId: string; // Student's email
  batchId: string; // For easier querying

  // Submission content
  content: string; // The actual writing
  wordCount: number;

  // Status
  status: 'draft' | 'submitted' | 'graded' | 'returned';

  // Timestamps
  startedAt?: number | null;
  submittedAt?: number | null;
  gradedAt?: number | null;

  // Grading
  score?: number | null;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string | null; // Teacher's email

  // Version tracking
  version: number;
  revisions: TaskRevision[];

  createdAt: number;
  updatedAt: number;
}

export interface TaskRevision {
  version: number;
  content: string;
  wordCount: number;
  savedAt: number;
}

/**
 * Study Progress Model
 * Path: progress/{progressId}
 * Format: PROG_{YYYYMMDD}_{email}
 * Daily/weekly learning statistics
 */
export interface StudyProgress {
  progressId: string;
  userId: string; // Student's email
  date: string; // YYYY-MM-DD format

  // Daily stats
  wordsStudied: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  timeSpent: number; // minutes

  // Practice details
  sessionsCompleted: number;
  cardsReviewed: number;
  sentencesCreated: number;

  createdAt: number;
}

/**
 * Vocabulary Word Model
 * Path: vocabulary/{wordId}
 * Top-level collection (global word bank)
 */
export interface VocabularyWord {
  wordId: string;
  germanWord: string;
  englishTranslation: string;

  partOfSpeech?: string; // noun, verb, adjective, etc.
  gender?: string; // for German nouns: der, die, das
  level: CEFRLevel;

  exampleSentence?: string;
  exampleTranslation?: string;
  audioUrl?: string;

  frequency: number; // How common (1-10)
  tags: string[]; // Categories like 'family', 'food', etc.

  createdAt: number;
}

/**
 * Flashcard Progress Model
 * Path: flashcards/{flashcardId}
 * Student's spaced repetition data
 */
export interface FlashcardProgress {
  flashcardId: string;
  userId: string; // Student's email
  wordId: string; // Reference to vocabulary word

  // SRS (Spaced Repetition System) data
  repetitions: number;
  easeFactor: number;
  interval: number; // days until next review
  nextReviewDate: number;

  // Performance
  correctCount: number;
  incorrectCount: number;
  lastReviewDate?: number | null;
  masteryLevel: number; // 0-100

  createdAt: number;
  updatedAt: number;
}

// ============================================
// Helper Types & Functions
// ============================================

/**
 * Get user's full name
 */
export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
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

/**
 * Get batch students (query helper)
 */
export interface BatchWithStats extends Batch {
  students: User[];
  completionRate: number;
  averageProgress: number;
}

/**
 * Get task with stats (query helper)
 */
export interface TaskWithStats extends WritingTask {
  submissionCount: number;
  completionRate: number;
  averageScore?: number;
  pendingGrading: number;
}

// ============================================
// Sample Data for Development
// ============================================

export const SAMPLE_STUDENT: User = {
  userId: 'student@testmanship.com',
  email: 'student@testmanship.com',
  firstName: 'Max',
  lastName: 'Mustermann',
  role: 'STUDENT',
  cefrLevel: CEFRLevel.A2,
  teacherId: 'teacher@testmanship.com',
  batchId: 'BATCH_001',

  wordsLearned: 342,
  wordsMastered: 187,
  sentencesCreated: 125,
  sentencesPerfect: 98,
  currentStreak: 7,
  longestStreak: 15,
  totalPracticeTime: 1240,
  dailyGoal: 25,
  lastActiveDate: Date.now(),

  notificationsEnabled: true,
  soundEnabled: true,

  createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
  updatedAt: Date.now(),
};

export const SAMPLE_TEACHER: User = {
  userId: 'teacher@testmanship.com',
  email: 'teacher@testmanship.com',
  firstName: 'Anna',
  lastName: 'Schmidt',
  role: 'TEACHER',

  totalStudents: 45,
  activeBatches: 3,

  createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000, // 180 days ago
  updatedAt: Date.now(),
};

export const SAMPLE_BATCH: Batch = {
  batchId: 'BATCH_001',
  teacherId: 'teacher@testmanship.com',

  name: 'Morning Batch A2',
  description: 'Beginner German class - Morning session',
  currentLevel: CEFRLevel.A2,

  isActive: true,
  startDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
  endDate: null,

  studentCount: 15,

  levelHistory: [
    {
      level: CEFRLevel.A1,
      startDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
      endDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      modifiedBy: 'teacher@testmanship.com',
      notes: 'Starting level',
    },
    {
      level: CEFRLevel.A2,
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      endDate: null,
      modifiedBy: 'teacher@testmanship.com',
      notes: 'Progressed to A2',
    },
  ],

  createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
};

// Legacy exports for backwards compatibility
export type Student = User;
export type Teacher = User;
export type StudentData = User;
