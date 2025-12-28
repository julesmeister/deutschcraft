/**
 * User Service - Database abstraction layer for user operations
 *
 * This service provides a unified interface for user operations
 * and automatically switches between Firebase and Turso based on environment.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All database operations are isolated in firebase.ts and turso.ts
 * - Hooks call these functions instead of using database directly
 * - Easy to swap databases by changing NEXT_PUBLIC_USE_TURSO environment variable
 */

// Determine which database to use
// TEMPORARILY FORCING FIREBASE FOR USER DATA (auth writes to Firebase, so reads should too)
const USE_TURSO = false; // process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// Import from the appropriate implementation
const implementation = USE_TURSO
  ? require("../turso/userService")
  : require("../userService");

// Re-export all functions
export const {
  // Core User Operations
  getUser,
  getUsers,
  upsertUser,
  updateUser,
  updateUserPhoto,
  deleteUser,

  // Student/Teacher Queries
  getTeacherStudents,
  getBatchStudents,
  getAllStudents,
  getAllTeachers,
  getAllNonTeachers,
  getStudentsWithoutTeacher,

  // Pagination (Turso only, but gracefully handled)
  getUsersPaginated,
  getUserCount,
  getPendingEnrollmentsPaginated,
  getPendingEnrollmentsCount,

  // Batch Assignment
  assignStudentToBatch,

  // Flashcard Settings
  getFlashcardSettings,
  updateFlashcardSettings,

  // Dashboard Settings
  updateDashboardSettings,
} = implementation;
