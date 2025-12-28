/**
 * Writing Progress Service - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from "./firebase";
import * as tursoImpl from "../turso/writingProgressService";

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === "true";

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  fetchUserWritingProgress,
  getTodayWritingProgress,
  updateDailyProgress,
  updateDailyProgressForQuiz,
  calculateWritingStreak,
  updateWritingStats,
} = implementation;
