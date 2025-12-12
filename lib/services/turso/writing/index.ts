/**
 * Writing Service - Turso Implementation (Main Export)
 * Database abstraction layer for writing operations using Turso DB
 *
 * This service handles all writing-related operations:
 * - Writing submissions (exercises, homework)
 * - Peer reviews and teacher reviews
 * - Writing progress and statistics
 *
 * Re-exports all functions from modular files to maintain backward compatibility
 */

// Helper functions (not exported - internal use only)
export { rowToSubmission, rowToExercise, rowToProgress, rowToStats } from './helpers';

// Exercise operations
export { getWritingExercises, getWritingExercise } from './exercises';

// Submission operations
export {
  getStudentSubmissions,
  getWritingSubmission,
  getExerciseSubmissions,
  getAllWritingSubmissions,
  getPendingWritingCount,
  createWritingSubmission,
  updateWritingSubmission,
  submitWriting,
  deleteWritingSubmission,
} from './submissions';

// Peer review operations
export {
  getPeerReviews,
  getAssignedPeerReviews,
  createPeerReview,
  updatePeerReview,
} from './peerReviews';

// Teacher review operations
export {
  getTeacherReview,
  getTeacherReviews,
  createTeacherReview,
  updateTeacherReview,
  getTeacherReviewsBatch,
} from './teacherReviews';

// Progress and stats operations
export {
  getWritingProgress,
  getWritingStats,
  updateWritingStats,
  updateWritingProgress,
} from './progress';
