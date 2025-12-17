/**
 * Grammar Service - Database abstraction layer for grammar exercise operations
 *
 * This service provides a unified interface for grammar exercise operations.
 * All imports should go through this file for consistency.
 *
 * Usage:
 * import { getGrammarRulesByLevel } from '@/lib/services/grammarService';
 * import { getGrammarRulesByLevel } from '@/lib/services';
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All database operations are isolated in the grammar/ modules
 * - Hooks call these functions instead of using database directly
 * - Easy to swap databases by changing NEXT_PUBLIC_USE_TURSO env variable
 */

// Re-export all functions from the modular grammar service
export * from './grammar';
