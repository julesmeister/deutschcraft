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

import type { User } from "../../models";

// Determine which database to use
const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === "true";

// Import from the appropriate implementation
const implementation = USE_TURSO
  ? require("../turso/userService")
  : require("./firebase");

// Re-export all functions
export const {
  // Core User Operations
  getUser,
  getUsers,
  upsertUser,
  // updateUser, // Overridden below for dual-write
  updateUserPhoto,
  deleteUser,

  // Student/Teacher Queries
  getTeacherStudents,
  getBatchStudents,
  getAllStudents,
  getAllTeachers,
  getAllNonTeachers,
  getStudentsWithoutTeacher,

  // Pagination
  getUsersPaginated,
  getUserCount,
  getUserStats,
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

/**
 * Update user details
 * WRAPPER: Handles dual-write to Firebase when Turso is enabled
 * This ensures legacy Firebase listeners/functions still work
 */
export const updateUser = async (
  email: string,
  updates: Partial<User>
): Promise<void> => {
  // 1. Perform the primary update (Turso or Firebase)
  await implementation.updateUser(email, updates);

  // 2. If using Turso, sync to Firebase
  if (USE_TURSO) {
    try {
      // Lazy load firebase to avoid circular deps or unnecessary loading
      const firebase = require("./firebase");
      await firebase.updateUser(email, updates);
    } catch (error) {
      console.warn("[userService] Failed to sync update to Firebase:", error);
      // Don't throw - primary update succeeded
    }
  }
};
