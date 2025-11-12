/**
 * Turso Services Index
 * Central export point for all Turso-compatible services
 *
 * Import from here to use Turso database services:
 * import { getUser, getAllStudents } from '@/lib/services/turso';
 */

// ============================================================================
// USER SERVICE
// ============================================================================
export {
  getUser,
  getTeacherStudents,
  getBatchStudents,
  getAllStudents,
  getAllTeachers,
  getStudentsWithoutTeacher,
  upsertUser,
  updateUser,
  updateUserPhoto,
  assignStudentToBatch,
  getFlashcardSettings,
  updateFlashcardSettings,
} from './userService';

// ============================================================================
// STUDENT SERVICE
// ============================================================================
export {
  initializeStudent,
  assignStudentsToBatch,
  removeStudentFromTeacher,
  updateStudentLevel,
} from './studentService';

// ============================================================================
// FLASHCARD SERVICE
// ============================================================================
export {
  getFlashcardsByLevel,
  getVocabularyWord,
  getVocabularyByLevel,
  getFlashcardProgress,
  getSingleFlashcardProgress,
  getStudyProgress,
  saveFlashcardProgress,
  saveDailyProgress,
} from './flashcardService';

// ============================================================================
// SESSION SERVICE
// ============================================================================
export {
  getSession,
  getUserSessions,
  getRecentSessions,
  createSession,
  completeSession,
  abandonSession,
  updateSessionData,
} from './sessionService';

// ============================================================================
// TASK SERVICE (Writing Tasks)
// ============================================================================
export {
  getTasksByBatch,
  getTasksByTeacherAndBatch,
  getTasksByStudent,
  getTask,
  createTask,
  updateTask,
  assignTask,
  deleteTask,
} from './taskService';

// ============================================================================
// BATCH SERVICE
// ============================================================================
export {
  getBatchesByTeacher,
  getBatch,
  getBatchStudentCount,
  createBatch,
  updateBatch,
  updateBatchLevel,
  archiveBatch,
} from './batchService';

// ============================================================================
// PRICING SERVICE
// ============================================================================
export {
  getCoursePricing,
  saveCoursePricing,
} from './pricingService';

// ============================================================================
// WRITING SERVICE (Advanced)
// ============================================================================
export {
  getWritingExercises,
  getWritingExercise,
  getStudentSubmissions,
  getWritingSubmission,
  getExerciseSubmissions,
  getAllWritingSubmissions,
  getPendingWritingCount,
  createWritingSubmission,
  updateWritingSubmission,
  submitWriting,
  deleteWritingSubmission,
  getPeerReviews,
  getAssignedPeerReviews,
  createPeerReview,
  updatePeerReview,
  getTeacherReview,
  getTeacherReviews,
  createTeacherReview,
  updateTeacherReview,
  getWritingProgress,
  getWritingStats,
  updateWritingStats,
  updateWritingProgress,
} from './writingService';

// ============================================================================
// PROGRESS SERVICE
// ============================================================================
export {
  fetchUserProgress,
  fetchProgressForDate,
  aggregateProgressByDate,
  getWeeklyProgress,
  calculateAccuracy,
  getTodayProgress,
  calculateStreak,
} from './progressService';

// ============================================================================
// WRITING ATTEMPT SERVICE
// ============================================================================
export {
  getNextAttemptNumber,
  getUserExerciseAttempts,
  getLatestAttempt,
  hasDraftAttempt,
  getAttemptStats,
} from './writingAttemptService';

// ============================================================================
// WRITING PROGRESS SERVICE
// ============================================================================
export {
  fetchUserWritingProgress,
  getTodayWritingProgress,
  updateDailyProgress,
  calculateWritingStreak,
  getTeacherWritingStats,
} from './writingProgressService';

// Note: updateWritingStats and updateWritingProgress are exported from both
// writingService and writingProgressService. Import them explicitly if needed.

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type { Session } from './sessionService';
export type { DailyProgress, WeeklyProgressData } from './progressService';
