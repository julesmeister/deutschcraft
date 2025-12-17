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
 * - vocabulary/{wordId}
 * - flashcards/{flashcardId}
 */

// CEFR Levels
export { CEFRLevel, CEFRLevelInfo } from './cefr';
export type { } from './cefr';

// User and Batch Models
export {
  getUserFullName,
  getStudentSuccessRate,
  isStudent,
  isTeacher,
} from './user';
export type {
  User,
  Batch,
  BatchLevelHistory,
  Student,
  Teacher,
  StudentData,
} from './user';

// Task Models
export type {
  WritingTask,
  TaskSubmission,
  TaskRevision,
} from './task';

// Progress Models
export type {
  CardState,
  StudyProgress,
  VocabularyWord,
  Flashcard,
  FlashcardProgress,
  FlashcardReviewHistory,
} from './progress';

// Extended Types
export type {
  BatchWithStats,
  TaskWithStats,
} from './extended';

// Sample Data
export {
  SAMPLE_STUDENT,
  SAMPLE_TEACHER,
  SAMPLE_BATCH,
} from './samples';

// Writing Exercise Models
export type {
  WritingExerciseType,
  TranslationExercise,
  CreativeWritingExercise,
  WritingPrompt,
  WritingSubmission,
  WritingFeedback,
  GrammarError,
  VocabularySuggestion,
  WritingVersion,
  TextChange,
  PeerReview,
  TeacherReview,
  WritingProgress,
  WritingStats,
} from './writing';

// Gantt Chart Models
export type {
  GanttTask,
  GanttTaskCreateInput,
  GanttTaskUpdateInput,
} from './gantt';

// Grammar Exercise Models
export type {
  GrammarRule,
  GrammarSentence,
  GrammarReview,
  GrammarReviewHistory,
  GrammarProgressSummary,
  DifficultyRating,
} from './grammar';
