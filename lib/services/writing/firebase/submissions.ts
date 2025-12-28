/**
 * Writing Submissions Service - Main Entry Point
 * Re-exports all submission-related operations
 */

export {
  getStudentSubmissions,
  getWritingSubmission,
  getExerciseSubmissions,
  getAllWritingSubmissions,
  getPendingWritingCount,
} from "./submissions-queries";

export {
  getWritingSubmissionsPaginated,
  getWritingSubmissionsCount,
} from "./submissions-pagination";

export {
  createWritingSubmission,
  updateWritingSubmission,
  submitWriting,
  deleteWritingSubmission,
} from "./submissions-mutations";
