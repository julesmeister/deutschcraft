-- Migration: 001_create_users_table
-- Description: Create users table for both students and teachers
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS users (
  -- Primary Key
  user_id TEXT PRIMARY KEY NOT NULL,      -- Email address
  email TEXT NOT NULL UNIQUE,             -- Email (same as user_id)

  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER')),
  photo_url TEXT,

  -- Student-specific fields (nullable, only populated for students)
  cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2') OR cefr_level IS NULL),
  teacher_id TEXT,                        -- Email of assigned teacher
  batch_id TEXT,                          -- Reference to batch

  -- Student learning stats
  words_learned INTEGER DEFAULT 0,
  words_mastered INTEGER DEFAULT 0,
  sentences_created INTEGER DEFAULT 0,
  sentences_perfect INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,  -- minutes
  daily_goal INTEGER DEFAULT 20,          -- words per day
  last_active_date INTEGER,               -- Unix timestamp

  -- Student settings
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,

  -- Flashcard settings (stored as JSON)
  flashcard_settings TEXT,                -- JSON: {cardsPerSession, autoPlayAudio, showExamples, randomizeOrder}

  -- Teacher-specific fields (computed fields, updated via triggers/app logic)
  total_students INTEGER DEFAULT 0,
  active_batches INTEGER DEFAULT 0,

  -- Common timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_teacher_id ON users(teacher_id);
CREATE INDEX IF NOT EXISTS idx_users_batch_id ON users(batch_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = unixepoch('now') * 1000 WHERE user_id = NEW.user_id;
END;
