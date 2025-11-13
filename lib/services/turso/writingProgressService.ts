/**
 * Writing Progress Service - Turso Implementation
 *
 * This file has been refactored into smaller modules for better maintainability.
 * It now serves as a thin wrapper that re-exports from ./writingProgress/
 *
 * The original 524-line file has been split into:
 * - writingProgress/helpers.ts (53 lines) - Data conversion utilities
 * - writingProgress/read.ts (72 lines) - Read operations
 * - writingProgress/tracking.ts (129 lines) - Daily progress tracking
 * - writingProgress/streaks.ts (74 lines) - Streak calculations
 * - writingProgress/stats.ts (157 lines) - Overall statistics
 * - writingProgress/analytics.ts (80 lines) - Teacher analytics
 * - writingProgress/index.ts (21 lines) - Re-exports
 *
 * All exports remain the same for backward compatibility.
 */

export {
  fetchUserWritingProgress,
  getTodayWritingProgress,
  updateDailyProgress,
  calculateWritingStreak,
  updateWritingStats,
  getTeacherWritingStats,
} from './writingProgress';
