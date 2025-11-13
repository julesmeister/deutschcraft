/**
 * Writing Service - Database abstraction layer for writing operations
 *
 * @deprecated This file has been split into smaller modules for better maintainability.
 * Please import from '@/lib/services/writing' instead, or use the re-export from '@/lib/services'
 *
 * New structure:
 * - lib/services/writing/exercises.ts - Exercise operations (89 lines)
 * - lib/services/writing/submissions.ts - Submission CRUD operations (270 lines)
 * - lib/services/writing/reviews.ts - Peer and teacher reviews (234 lines)
 * - lib/services/writing/progress.ts - Progress and statistics (134 lines)
 * - lib/services/writing/index.ts - Main entry point with all re-exports (123 lines)
 *
 * This file is kept for backward compatibility but will be removed in a future version.
 * All exports below now simply re-export from the new modular structure.
 *
 * Original file was 777 lines - now split into 5 focused modules, each under 300 lines.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated in the writing/ subdirectory
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

// Re-export everything from the new modular structure
export * from './writing';
