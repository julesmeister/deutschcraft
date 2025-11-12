-- Migration: 006_create_progress_table
-- Description: Create daily study progress tracking table
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS progress (
  -- Primary Key
  progress_id TEXT PRIMARY KEY NOT NULL,  -- Format: PROG_{YYYYMMDD}_{email}

  -- User reference
  user_id TEXT NOT NULL,                  -- Student's email
  date TEXT NOT NULL,                     -- YYYY-MM-DD format

  -- Daily statistics
  words_studied INTEGER DEFAULT 0,
  words_correct INTEGER DEFAULT 0,
  words_incorrect INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,          -- minutes

  -- Practice details
  sessions_completed INTEGER DEFAULT 0,
  cards_reviewed INTEGER DEFAULT 0,
  sentences_created INTEGER DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON progress(date);
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_progress_created_at ON progress(created_at);

-- Unique constraint to prevent duplicate daily entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique_user_date ON progress(user_id, date);
