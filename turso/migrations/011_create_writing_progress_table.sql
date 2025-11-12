-- Migration: 011_create_writing_progress_table
-- Description: Create writing progress table for tracking daily writing stats
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS writing_progress (
  -- Primary Key
  progress_id TEXT PRIMARY KEY NOT NULL,  -- Format: WPROG_{YYYYMMDD}_{email}

  -- User reference
  user_id TEXT NOT NULL,                  -- Student's email
  date TEXT NOT NULL,                     -- YYYY-MM-DD format

  -- Daily statistics
  exercises_completed INTEGER DEFAULT 0,
  translations_completed INTEGER DEFAULT 0,
  creative_writings_completed INTEGER DEFAULT 0,
  total_words_written INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,          -- minutes

  -- Performance
  average_grammar_score REAL DEFAULT 0,
  average_vocabulary_score REAL DEFAULT 0,
  average_overall_score REAL DEFAULT 0,

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_writing_progress_user_id ON writing_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_progress_date ON writing_progress(date);
CREATE INDEX IF NOT EXISTS idx_writing_progress_user_date ON writing_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_writing_progress_created_at ON writing_progress(created_at);

-- Unique constraint to prevent duplicate daily entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_writing_progress_unique_user_date ON writing_progress(user_id, date);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_writing_progress_updated_at
AFTER UPDATE ON writing_progress
FOR EACH ROW
BEGIN
  UPDATE writing_progress SET updated_at = unixepoch('now') * 1000 WHERE progress_id = NEW.progress_id;
END;
