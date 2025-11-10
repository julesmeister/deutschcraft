/**
 * Sample Data for Development and Testing
 */

import { CEFRLevel } from './cefr';
import { User, Batch, BatchLevelHistory } from './user';

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
