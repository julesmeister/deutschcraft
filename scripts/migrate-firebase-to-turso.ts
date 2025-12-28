/**
 * Direct Firebase → Turso Migration Script
 * Bypasses auth checks - run this directly with: npx tsx scripts/migrate-firebase-to-turso.ts
 */

import { adminDb } from '../lib/firebaseAdmin';
import { db } from '../turso/client';

async function migrateData() {
  console.log('🚀 Starting Firebase → Turso migration...\n');

  const stats: any = {
    users: 0,
    batches: 0,
    tasks: 0,
    submissions: 0,
    progress: 0,
    vocabulary: 0,
    flashcards: 0,
    flashcardProgress: 0,
    exerciseOverrides: 0,
    savedVocabulary: 0,
    activities: 0,
    grammarRules: 0,
    grammarSentences: 0,
    grammarReviews: 0,
  };

  try {
    // 1. Migrate users
    console.log('[1/14] Migrating users...');
    const usersSnapshot = await adminDb.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      await db.execute({
        sql: `INSERT OR REPLACE INTO users (
          email, user_id, name, first_name, last_name, photo_url, role,
          cefr_level, teacher_id, batch_id, enrollment_status,
          desired_cefr_level, words_learned, current_streak,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          doc.id,
          data.userId || doc.id,
          data.name || null,
          data.firstName || null,
          data.lastName || null,
          data.photoURL || null,
          data.role || 'PENDING_APPROVAL',
          data.cefrLevel || null,
          data.teacherId || null,
          data.batchId || null,
          data.enrollmentStatus || null,
          data.desiredCefrLevel || null,
          data.wordsLearned || 0,
          data.currentStreak || 0,
          data.createdAt || Date.now(),
          data.updatedAt || Date.now(),
        ],
      });
      stats.users++;
    }
    console.log(`✓ Migrated ${stats.users} users\n`);

    // 2. Migrate batches
    console.log('[2/14] Migrating batches...');
    const batchesSnapshot = await adminDb.collection('batches').get();
    for (const doc of batchesSnapshot.docs) {
      const data = doc.data();
      await db.execute({
        sql: `INSERT OR REPLACE INTO batches (
          batch_id, name, description, teacher_id, current_level,
          start_date, end_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          doc.id,
          data.name,
          data.description || null,
          data.teacherId,
          data.currentLevel,
          data.startDate,
          data.endDate || null,
          data.createdAt || Date.now(),
          data.updatedAt || Date.now(),
        ],
      });
      stats.batches++;
    }
    console.log(`✓ Migrated ${stats.batches} batches\n`);

    // 3. Migrate tasks
    console.log('[3/14] Migrating tasks...');
    const tasksSnapshot = await adminDb.collection('tasks').get();
    for (const doc of tasksSnapshot.docs) {
      const data = doc.data();
      await db.execute({
        sql: `INSERT OR REPLACE INTO tasks (
          task_id, title, description, type, level,
          created_by, assigned_to, due_date, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          doc.id,
          data.title,
          data.description || null,
          data.type,
          data.level,
          data.createdBy,
          data.assignedTo || null,
          data.dueDate || null,
          data.status || 'pending',
          data.createdAt || Date.now(),
          data.updatedAt || Date.now(),
        ],
      });
      stats.tasks++;
    }
    console.log(`✓ Migrated ${stats.tasks} tasks\n`);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Final Statistics:');
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('\n🎉 All done! You can now use Turso.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
