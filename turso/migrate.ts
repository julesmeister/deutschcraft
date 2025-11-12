/**
 * Turso Database Migration Runner
 *
 * This script runs all pending migrations in the turso/migrations folder.
 * Migrations are executed in alphabetical order (001_, 002_, etc.).
 *
 * Usage:
 * npx tsx turso/migrate.ts
 *
 * Environment Variables Required:
 * - TURSO_DATABASE_URL: Your Turso database URL
 * - TURSO_AUTH_TOKEN: Your Turso authentication token
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from './client';

interface Migration {
  id: string;
  filename: string;
  sql: string;
}

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY NOT NULL,
      filename TEXT NOT NULL,
      executed_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
    );
  `;

  await db.execute(sql);
  console.log('✓ Migrations table ready');
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await db.execute('SELECT id FROM migrations ORDER BY id ASC');
  const executed = new Set<string>();

  for (const row of result.rows) {
    executed.add(row.id as string);
  }

  return executed;
}

/**
 * Load all migration files from the migrations folder
 */
function loadMigrations(): Migration[] {
  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Alphabetical order (001, 002, etc.)

  const migrations: Migration[] = [];

  for (const filename of files) {
    const filePath = join(migrationsDir, filename);
    const sql = readFileSync(filePath, 'utf-8');
    const id = filename.replace('.sql', '');

    migrations.push({ id, filename, sql });
  }

  return migrations;
}

/**
 * Execute a single migration
 */
async function executeMigration(migration: Migration) {
  console.log(`\n▶ Running migration: ${migration.filename}`);

  try {
    // Execute the migration SQL
    await db.execute(migration.sql);

    // Record the migration as executed
    await db.execute(
      'INSERT INTO migrations (id, filename) VALUES (?, ?)',
      [migration.id, migration.filename]
    );

    console.log(`✓ Completed: ${migration.filename}`);
  } catch (error) {
    console.error(`✗ Failed: ${migration.filename}`);
    throw error;
  }
}

/**
 * Main migration function
 */
async function runMigrations() {
  console.log('🚀 Starting Turso DB migrations...\n');

  try {
    // Step 1: Ensure migrations table exists
    await createMigrationsTable();

    // Step 2: Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`📊 Found ${executedMigrations.size} executed migrations`);

    // Step 3: Load all migration files
    const allMigrations = loadMigrations();
    console.log(`📂 Found ${allMigrations.length} migration files\n`);

    // Step 4: Filter pending migrations
    const pendingMigrations = allMigrations.filter(
      m => !executedMigrations.has(m.id)
    );

    if (pendingMigrations.length === 0) {
      console.log('✓ No pending migrations. Database is up to date!');
      return;
    }

    console.log(`⏳ Running ${pendingMigrations.length} pending migrations...\n`);

    // Step 5: Execute each pending migration
    for (const migration of pendingMigrations) {
      await executeMigration(migration);
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.close();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
