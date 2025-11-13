/**
 * Service Layer - Database Abstraction
 *
 * This file automatically switches between Firebase and Turso based on environment variables.
 *
 * Usage in your app:
 * import { getUser, getAllStudents } from '@/lib/services';
 *
 * To switch databases, set environment variable:
 * DATABASE_PROVIDER=turso  (uses Turso)
 * DATABASE_PROVIDER=firebase (uses Firebase - default)
 *
 * Note: Export switching must be done at build time, not runtime.
 * For now, we default to Firebase. To use Turso, import from '@/lib/services/turso' directly.
 */

// Core services - fully implemented and exported
export * from './userService';
export * from './studentService';
export * from './flashcardService';
export * from './sessionService';
export * from './taskService';
export * from './batchService';
export * from './pricingService';

// Writing services - split into modular structure
// Now organized in lib/services/writing/ directory
export * from './writing';

// Playground services - split into modular structure
// Now organized in lib/services/playground/ directory
export * from './playground';

/**
 * Helper function to check which database is being used
 * This checks at runtime and logs a warning if mismatch detected
 */
export function getDatabaseProvider(): 'firebase' | 'turso' {
  const provider = process.env.DATABASE_PROVIDER || 'firebase';
  if (provider === 'turso') {
    console.warn(
      '[Services] DATABASE_PROVIDER is set to "turso" but Firebase services are being used. ' +
      'To use Turso services, import from "@/lib/services/turso" directly.'
    );
  }
  return 'firebase'; // This file always exports Firebase
}
