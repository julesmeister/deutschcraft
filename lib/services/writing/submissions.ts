/**
 * Writing Submissions Service - Main Entry Point
 * Re-exports all submission-related operations
 *
 * This file maintains backward compatibility while organizing
 * code into smaller, focused modules
 */

// Re-export query operations
export {
  getStudentSubmissions,
  getWritingSubmission,
  getExerciseSubmissions,
  getAllWritingSubmissions,
  getPendingWritingCount,
} from './submissions-queries';

// Re-export pagination operations
export {
  getWritingSubmissionsPaginated,
  getWritingSubmissionsCount,
} from './submissions-pagination';

// Re-export mutation operations
export {
  createWritingSubmission,
  updateWritingSubmission,
  submitWriting,
  deleteWritingSubmission,
} from './submissions-mutations';
