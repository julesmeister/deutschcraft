/**
 * Writing Service - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from "./firebase";
import * as tursoImpl from "../turso/writing";

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === "true";

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  // Exercises
  getWritingExercises,
  getWritingExercise,

  // Submissions (Queries)
  getStudentSubmissions,
  getWritingSubmission,
  getExerciseSubmissions,
  getAllWritingSubmissions,
  getPendingWritingCount,

  // Submissions (Pagination)
  getWritingSubmissionsPaginated,
  getWritingSubmissionsCount,

  // Submissions (Mutations)
  createWritingSubmission,
  updateWritingSubmission,
  saveAICorrectedVersion,
  submitWriting,
  deleteWritingSubmission,

  // Peer Reviews
  getPeerReviews,
  getAssignedPeerReviews,
  createPeerReview,
  updatePeerReview,

  // Teacher Reviews
  getTeacherReview,
  getTeacherReviews,
  getTeacherReviewsBatch,
  createTeacherReview,
  updateTeacherReview,

  // Progress & Stats
  getWritingStats,
  updateWritingStats,
  getWritingProgress,
  updateWritingProgress,
  calculateWritingStats,
} = implementation;
