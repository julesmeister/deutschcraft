#!/usr/bin/env tsx

/**
 * Rollback Script
 * Restores all migrated files from their backups
 * Safely reverses the migration process
 */

import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const DATA_DIR = path.join(process.cwd(), 'lib/data/vocabulary/levels');
const SPLIT_BASE_DIR = path.join(process.cwd(), 'lib/data/vocabulary/split');

interface BackupFile {
  backupPath: string;
  originalPath: string;
  type: 'level' | 'split';
}

async function rollback() {
  console.log('🔄 Starting Rollback Process...\n');
  console.log('='.repeat(50));

  const backupFiles: BackupFile[] = [];

  // Find all backup files
  console.log('\n📂 Scanning for backup files...\n');

  // Check main level files
  for (const level of LEVELS) {
    const dir = DATA_DIR;
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    const backups = files.filter(f => f.includes('.backup-') && f.endsWith('.json'));

    for (const backup of backups) {
      const backupPath = path.join(dir, backup);
      // Extract original filename (e.g., "a1.backup-123456.json" -> "a1.json")
      const originalName = backup.split('.backup-')[0] + '.json';
      const originalPath = path.join(dir, originalName);

      backupFiles.push({ backupPath, originalPath, type: 'level' });
    }
  }

  // Check split category files
  for (const level of LEVELS) {
    const levelDir = path.join(SPLIT_BASE_DIR, level);
    if (!fs.existsSync(levelDir)) continue;

    const files = fs.readdirSync(levelDir);
    const backups = files.filter(f => f.includes('.backup-') && f.endsWith('.json'));

    for (const backup of backups) {
      const backupPath = path.join(levelDir, backup);
      // Extract original filename (e.g., "adjectives.json.backup-123456.json" -> "adjectives.json")
      const originalName = backup.replace(/\.backup-\d+\.json$/, '');
      const originalPath = path.join(levelDir, originalName);

      backupFiles.push({ backupPath, originalPath, type: 'split' });
    }
  }

  console.log(`✅ Found ${backupFiles.length} backup files`);
  console.log(`   - Level files: ${backupFiles.filter(b => b.type === 'level').length}`);
  console.log(`   - Split files: ${backupFiles.filter(b => b.type === 'split').length}\n`);

  if (backupFiles.length === 0) {
    console.log('⚠️  No backup files found. Nothing to rollback.');
    return;
  }

  // Restore each backup
  console.log('🔄 Restoring files from backups...\n');

  let restoredCount = 0;
  let errorCount = 0;

  for (const { backupPath, originalPath, type } of backupFiles) {
    try {
      // Copy backup to original location
      fs.copyFileSync(backupPath, originalPath);
      console.log(`   ✅ Restored: ${path.basename(originalPath)} (${type})`);
      restoredCount++;
    } catch (error) {
      console.error(`   ❌ Failed to restore ${path.basename(originalPath)}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Rollback Summary:');
  console.log(`   - Files restored: ${restoredCount}`);
  console.log(`   - Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n✅ Rollback complete! All files restored from backups.');
    console.log('\n💡 Tip: Backup files are still preserved. You can delete them manually if desired.');
  } else {
    console.error('\n⚠️  Rollback completed with errors. Please check the error messages above.');
  }
}

rollback().catch(error => {
  console.error('❌ Fatal error during rollback:', error);
  process.exit(1);
});
