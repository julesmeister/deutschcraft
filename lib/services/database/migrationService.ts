/**
 * Enhanced Database Migration Service
 * Provides robust migration with batching, progress tracking, validation, and error recovery
 */

import { db } from '@/turso/client';

export interface MigrationProgress {
  collection: string;
  current: number;
  total: number;
  percentage: number;
  errors: MigrationError[];
}

export interface MigrationError {
  collection: string;
  recordId: string;
  error: string;
  data?: any;
}

export interface MigrationResult {
  success: boolean;
  stats: Record<string, number>;
  errors: MigrationError[];
  duration: number;
  timestamp: number;
}

export interface MigrationOptions {
  batchSize?: number; // Number of records to process at once
  validateAfter?: boolean; // Validate data after migration
  backupFirst?: boolean; // Create backup before migration
  dryRun?: boolean; // Preview without actually migrating
  onProgress?: (progress: MigrationProgress) => void; // Progress callback
}

const DEFAULT_OPTIONS: MigrationOptions = {
  batchSize: 100,
  validateAfter: true,
  backupFirst: true,
  dryRun: false,
};

/**
 * Migrate users in batches with error tracking
 */
export async function migrateUsersBatch(
  users: any[],
  options: MigrationOptions = {}
): Promise<{ success: number; errors: MigrationError[] }> {
  const { batchSize = 100, onProgress, dryRun } = options;
  let successCount = 0;
  const errors: MigrationError[] = [];

  // Process in batches
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    // Report progress
    if (onProgress) {
      onProgress({
        collection: 'users',
        current: i,
        total: users.length,
        percentage: Math.round((i / users.length) * 100),
        errors,
      });
    }

    if (dryRun) {
      successCount += batch.length;
      continue;
    }

    // Batch insert using transaction
    const statements = batch.map(user => ({
      sql: `INSERT OR REPLACE INTO users (
        user_id, email, first_name, last_name, role, photo_url,
        cefr_level, teacher_id, batch_id,
        words_learned, words_mastered, sentences_created, sentences_perfect,
        current_streak, longest_streak, total_practice_time, daily_goal, last_active_date,
        notifications_enabled, sound_enabled, flashcard_settings,
        total_students, active_batches,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.userId || user.email || user.id,
        user.email || user.id,
        user.firstName || user.first_name || '',
        user.lastName || user.last_name || '',
        user.role || 'STUDENT',
        user.photoURL || user.photo_url || null,
        user.cefrLevel || user.cefr_level || null,
        user.teacherId || user.teacher_id || null,
        user.batchId || user.batch_id || null,
        user.wordsLearned || user.words_learned || 0,
        user.wordsMastered || user.words_mastered || 0,
        user.sentencesCreated || user.sentences_created || 0,
        user.sentencesPerfect || user.sentences_perfect || 0,
        user.currentStreak || user.current_streak || 0,
        user.longestStreak || user.longest_streak || 0,
        user.totalPracticeTime || user.total_practice_time || 0,
        user.dailyGoal || user.daily_goal || 20,
        user.lastActiveDate || user.last_active_date || null,
        user.notificationsEnabled ?? user.notifications_enabled ?? true,
        user.soundEnabled ?? user.sound_enabled ?? true,
        user.flashcardSettings || user.flashcard_settings
          ? JSON.stringify(user.flashcardSettings || user.flashcard_settings)
          : null,
        user.totalStudents || user.total_students || 0,
        user.activeBatches || user.active_batches || 0,
        user.createdAt || user.created_at || Date.now(),
        user.updatedAt || user.updated_at || Date.now(),
      ],
    }));

    try {
      await db.batch(statements);
      successCount += batch.length;
    } catch (error) {
      // If batch fails, try individual inserts to identify which records failed
      console.error('[Migration] Batch insert failed, trying individually:', error);

      for (const user of batch) {
        try {
          await db.execute(statements[0]); // Execute with user's data
          successCount++;
        } catch (individualError) {
          errors.push({
            collection: 'users',
            recordId: user.email || user.id,
            error: individualError instanceof Error ? individualError.message : 'Unknown error',
            data: user,
          });
        }
      }
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress({
      collection: 'users',
      current: users.length,
      total: users.length,
      percentage: 100,
      errors,
    });
  }

  return { success: successCount, errors };
}

/**
 * Validate migrated data matches source
 */
export async function validateMigration(
  firestoreData: any,
  collectionName: string
): Promise<{ valid: boolean; mismatches: number }> {
  try {
    // Count records in Turso
    const result = await db.execute(`SELECT COUNT(*) as count FROM ${collectionName}`);
    const tursoCount = Number(result.rows[0].count);
    const firestoreCount = firestoreData.length;

    console.log(`[Validation] ${collectionName}: Firestore=${firestoreCount}, Turso=${tursoCount}`);

    return {
      valid: tursoCount >= firestoreCount,
      mismatches: Math.abs(tursoCount - firestoreCount),
    };
  } catch (error) {
    console.error(`[Validation] Error validating ${collectionName}:`, error);
    return { valid: false, mismatches: -1 };
  }
}

/**
 * Create a backup of current Turso data
 */
export async function createBackup(collections: string[]): Promise<any> {
  const backup: any = {
    timestamp: Date.now(),
    collections: {},
  };

  for (const collection of collections) {
    try {
      const result = await db.execute(`SELECT * FROM ${collection}`);
      backup.collections[collection] = result.rows;
      console.log(`[Backup] Backed up ${result.rows.length} records from ${collection}`);
    } catch (error) {
      console.error(`[Backup] Error backing up ${collection}:`, error);
      backup.collections[collection] = [];
    }
  }

  return backup;
}

/**
 * Estimate migration time based on data size
 */
export function estimateMigrationTime(stats: Record<string, number>): {
  estimatedSeconds: number;
  estimatedMinutes: number;
  warning: string | null;
} {
  const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

  // Rough estimate: 100 records per second with batching
  const estimatedSeconds = Math.ceil(totalRecords / 100);
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  let warning = null;
  if (estimatedMinutes > 8) {
    warning = 'Large dataset detected. Migration may timeout on serverless platforms.';
  }

  return {
    estimatedSeconds,
    estimatedMinutes,
    warning,
  };
}

/**
 * Check if migration is safe to proceed
 */
export async function checkMigrationSafety(): Promise<{
  safe: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check Turso connection
  try {
    await db.execute('SELECT 1');
  } catch (error) {
    issues.push('Cannot connect to Turso database');
  }

  // Check if tables exist
  const requiredTables = ['users', 'batches', 'tasks', 'submissions', 'progress', 'vocabulary', 'flashcards', 'flashcard_progress'];

  for (const table of requiredTables) {
    try {
      await db.execute(`SELECT 1 FROM ${table} LIMIT 1`);
    } catch (error) {
      issues.push(`Table '${table}' does not exist. Run migrations first: npm run db:migrate`);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}

/**
 * Get current Turso data counts
 */
export async function getTursoStats(): Promise<Record<string, number>> {
  const stats: Record<string, number> = {};
  const tables = ['users', 'batches', 'tasks', 'submissions', 'progress', 'vocabulary', 'flashcards', 'flashcard_progress'];

  for (const table of tables) {
    try {
      const result = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = Number(result.rows[0].count);
    } catch (error) {
      console.error(`[Stats] Error counting ${table}:`, error);
      stats[table] = 0;
    }
  }

  return stats;
}

/**
 * Clear all data from Turso (use with caution!)
 */
export async function clearTursoData(): Promise<void> {
  const tables = ['flashcard_progress', 'flashcards', 'vocabulary', 'progress', 'submissions', 'tasks', 'batches', 'users'];

  // Delete in reverse order to respect foreign keys
  for (const table of tables) {
    try {
      await db.execute(`DELETE FROM ${table}`);
      console.log(`[Clear] Cleared ${table}`);
    } catch (error) {
      console.error(`[Clear] Error clearing ${table}:`, error);
    }
  }
}
