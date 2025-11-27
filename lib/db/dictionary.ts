/**
 * Dictionary Database Setup
 * Local SQLite database for German-English dictionary
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file location
const DB_PATH = path.join(process.cwd(), 'data', 'dictionary.db');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
export function initDictionary() {
  // Create dictionary table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      german TEXT NOT NULL,
      english TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(german, english)
    );
  `);

  // Create indexes for fast lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_german ON dictionary(german);
    CREATE INDEX IF NOT EXISTS idx_english ON dictionary(english);
    CREATE INDEX IF NOT EXISTS idx_german_lower ON dictionary(LOWER(german));
  `);

  console.log('[Dictionary DB] Schema initialized');
}

/**
 * Get dictionary entry count
 */
export function getDictionaryCount(): number {
  const result = db.prepare('SELECT COUNT(*) as count FROM dictionary').get() as { count: number };
  return result.count;
}

/**
 * Close database connection
 */
export function closeDictionary() {
  db.close();
}

// Initialize schema on import
initDictionary();
