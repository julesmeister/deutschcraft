-- Migration: Create marked_word_progress table
-- Description: Tracks SRS progress for individual marked words for optimized querying
-- Created: 2026-01-07

CREATE TABLE IF NOT EXISTS marked_word_progress (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  item_number TEXT NOT NULL,
  word_start_index INTEGER NOT NULL,
  word TEXT NOT NULL,
  
  -- SRS Stats
  srs_interval INTEGER DEFAULT 0, -- In days
  srs_phase TEXT DEFAULT 'new', -- 'new', 'learning', 'review', 'mastered'
  next_review_at INTEGER DEFAULT 0, -- Timestamp
  last_reviewed_at INTEGER DEFAULT 0, -- Timestamp
  consecutive_correct INTEGER DEFAULT 0,
  
  -- Metadata
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000),

  -- Link back to user
  FOREIGN KEY (student_id) REFERENCES users(email) ON DELETE CASCADE,
  
  -- Ensure uniqueness for a specific marked word instance
  UNIQUE(student_id, exercise_id, item_number, word_start_index)
);

-- Index for finding due items quickly
CREATE INDEX IF NOT EXISTS idx_marked_word_progress_due 
ON marked_word_progress(student_id, next_review_at);

-- Index for finding specific word progress
CREATE INDEX IF NOT EXISTS idx_marked_word_progress_lookup
ON marked_word_progress(student_id, exercise_id, item_number);
