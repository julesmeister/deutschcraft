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
// TRANSACTION SERVICE
// ============================================================================
export {
  createTransaction,
  getTransaction,
  getUserTransactions,
  getPendingTransactions,
  getAllTransactions,
  getTransactionsPaginated,
  getTransactionsCount,
  updateTransaction,
  verifyTransaction,
  rejectTransaction,
} from './transactionService';

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
} from './writing';

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
// SOCIAL MEDIA SERVICE
// ============================================================================
export {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  createComment,
  getComments,
  deleteComment,
  createSuggestion,
  getSuggestions,
  updateSuggestion,
  acceptSuggestion,
  voteSuggestion,
  toggleLike,
  hasUserLiked,
  sharePost,
  getUserSocialStats,
} from './socialService';

// ============================================================================
// MEDIA SERVICE
// ============================================================================
export {
  uploadMedia,
  getMedia,
  getPostMedia,
  getPostMediaUrls,
  deleteMedia,
  deletePostMedia,
  getUserStorageUsage,
  getStorageStats,
  compressImage,
  generateVideoThumbnail,
  validateFile,
  fileToBase64,
  base64ToDataUrl,
} from './mediaService';

// ============================================================================
// VIDEO SERVICE
// ============================================================================
export {
  uploadVideo,
  getAllVideos,
  getVideosByCategory,
  getVideosByLevel,
  getVideosByCategoryAndLevel,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideosByTeacher,
  getVideoStats,
} from './videoService';

// ============================================================================
// REVIEW QUIZ SERVICE (NEW - 2025-12-28)
// ============================================================================
export {
  getReviewQuiz,
  getUserReviewQuizzes,
  getUserQuizStats,
  getSubmissionQuizzes,
  createReviewQuiz,
  updateQuizAnswers,
  completeQuiz,
  deleteReviewQuiz,
} from './reviewQuizService';

// ============================================================================
// STUDENT ANSWER SERVICE (NEW - 2025-12-28)
// ============================================================================
export {
  getExerciseAnswers,
  getExerciseAnswersGrouped,
  getStudentAnswers,
  getAnswer,
  getAnswerHubStats,
  saveStudentAnswer,
  gradeAnswer,
  deleteStudentAnswer,
  deleteExerciseAnswers,
} from './studentAnswerService';

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type { Session } from './sessionService';
export type { DailyProgress, WeeklyProgressData } from './progressService';
export type { MediaFile, UploadOptions } from './mediaService';
export type { LearningVideo, VideoUploadData, VideoCategory, CEFRLevel } from './videoService';
export type { QuizStats } from './reviewQuizService';
export type { AnswerHubStats } from './studentAnswerService';
