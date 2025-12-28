/**
 * Progress Service - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from "./firebase";
import * as tursoImpl from "../turso/progressService";

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === "true";

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  fetchUserProgress,
  fetchProgressForDate,
  aggregateProgressByDate,
  getWeeklyProgress,
  calculateAccuracy,
  getTodayProgress,
  calculateStreak,
} = implementation;

// Re-export types from firebase implementation
export type { DailyProgress, WeeklyProgressData } from "./firebase";
