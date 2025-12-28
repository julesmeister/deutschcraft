/**
 * Writing Progress Service - Turso Implementation
 * Centralized service for tracking and calculating writing progress
 *
 * This module has been split into smaller, focused files for better maintainability:
 * - helpers.ts: Data conversion utilities
 * - read.ts: Read operations for fetching progress
 * - tracking.ts: Daily progress tracking updates
 * - streaks.ts: Streak calculation logic
 * - stats.ts: Overall statistics management
 * - analytics.ts: Teacher dashboard analytics
 */

// Re-export all functions for backward compatibility
export { fetchUserWritingProgress, getTodayWritingProgress } from './read';
export { updateDailyProgress, updateDailyProgressForQuiz } from './tracking';
export { calculateWritingStreak } from './streaks';
export { updateWritingStats } from './stats';
export { getTeacherWritingStats } from './analytics';

// Re-export helper functions (in case they're needed externally)
export { rowToProgress, rowToStats } from './helpers';
