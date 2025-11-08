/**
 * Data Models for Testmanship Web V2
 * Extracted from Testmanship Android app (Kotlin models)
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

// Base User model
export interface User {
  id: string;
  email: string;
  name: string;
  profilePictureUrl?: string;
  role: 'student' | 'teacher';
  createdAt: number;
  updatedAt: number;
}

// Student model (extends User)
export interface Student {
  studentId: string;
  userId: string;
  teacherId?: string | null;
  targetLanguage: string;
  currentLevel: CEFRLevel;

  // Learning Statistics
  wordsLearned: number;
  wordsMastered: number;
  sentencesCreated: number;
  sentencesPerfect: number;
  currentStreak: number;
  longestStreak: number;
  totalPracticeTime: number; // in minutes
  lastActiveDate?: number | null;

  // Settings
  dailyGoal: number; // words per day
  notificationsEnabled: boolean;
  soundEnabled: boolean;

  createdAt: number;
  updatedAt: number;
}

// Computed properties for Student
export function getStudentSuccessRate(student: Student): number {
  if (student.sentencesCreated === 0) return 0;
  return (student.sentencesPerfect / student.sentencesCreated) * 100;
}

export function isStudentActiveToday(student: Student): boolean {
  if (!student.lastActiveDate) return false;
  const today = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const lastActive = Math.floor(student.lastActiveDate / (24 * 60 * 60 * 1000));
  return today === lastActive;
}

// Teacher model (extends User)
export interface Teacher {
  teacherId: string;
  userId: string;
  department?: string | null;
  specialization: string;
  totalStudents: number;
  activeStudents: number;
  createdAt: number;
  updatedAt: number;
}

// Vocabulary Word model
export interface VocabularyWord {
  id: string;
  germanWord: string;
  englishTranslation: string;
  partOfSpeech?: string; // noun, verb, adjective, etc.
  gender?: string; // for German nouns: der, die, das
  level: CEFRLevel;
  exampleSentence?: string;
  audioUrl?: string;
  createdAt: number;
}

// Flashcard model
export interface Flashcard {
  id: string;
  wordId: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  type: 'translation' | 'fill-in-blank' | 'multiple-choice';
  level: CEFRLevel;
  createdAt: number;
}

// Flashcard Progress (Spaced Repetition System)
export interface FlashcardProgress {
  id: string;
  userId: string;
  wordId: string;

  // SRS algorithm data
  repetitions: number;
  easeFactor: number;
  interval: number; // days until next review
  nextReviewDate: number;

  // Performance tracking
  correctCount: number;
  incorrectCount: number;
  lastReviewDate?: number | null;
  masteryLevel: number; // 0-100

  createdAt: number;
  updatedAt: number;
}

// Study Progress model
export interface StudyProgress {
  id: string;
  userId: string;
  date: number; // timestamp
  wordsStudied: number;
  wordsCorrect: number;
  timeSpent: number; // in minutes
  level: CEFRLevel;
  createdAt: number;
}

// Dashboard Statistics
export interface DashboardStats {
  totalWords: number;
  masteredWords: number;
  currentStreak: number;
  longestStreak: number;
  todayProgress: number;
  weeklyProgress: number[];
  weakWords: VocabularyWord[];
  recentActivity: StudyProgress[];
}

// Student with User (joined data)
export interface StudentWithUser {
  student: Student;
  user: User;
}

// Teacher with User (joined data)
export interface TeacherWithUser {
  teacher: Teacher;
  user: User;
}

// Sample data for development/preview
export const SAMPLE_USER: User = {
  id: 'user_1',
  email: 'student@testmanship.com',
  name: 'Max Mustermann',
  role: 'student',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const SAMPLE_STUDENT: Student = {
  studentId: 'STU001',
  userId: 'user_1',
  targetLanguage: 'German',
  currentLevel: CEFRLevel.B1,
  wordsLearned: 342,
  wordsMastered: 187,
  sentencesCreated: 156,
  sentencesPerfect: 124,
  currentStreak: 7,
  longestStreak: 21,
  totalPracticeTime: 1240,
  lastActiveDate: Date.now(),
  dailyGoal: 20,
  notificationsEnabled: true,
  soundEnabled: true,
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
};

export const SAMPLE_TEACHER: Teacher = {
  teacherId: 'TCH001',
  userId: 'user_2',
  department: 'Languages',
  specialization: 'German Language',
  totalStudents: 24,
  activeStudents: 18,
  createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
};
