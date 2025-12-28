-- Migration: 031_create_writing_stats_table
-- Description: Create writing stats table for overall user statistics
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS writing_stats (
  -- Primary Key
  user_id TEXT PRIMARY KEY NOT NULL,      -- Student's email

  -- Overall counters
  total_exercises_completed INTEGER DEFAULT 0,
  total_translations INTEGER DEFAULT 0,
  total_creative_writings INTEGER DEFAULT 0,
  total_words_written INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,    -- minutes

  -- Performance Averages
  average_grammar_score REAL DEFAULT 0,
  average_vocabulary_score REAL DEFAULT 0,
  average_coherence_score REAL DEFAULT 0,
  average_overall_score REAL DEFAULT 0,

  -- Breakdown by level (JSON)
  exercises_by_level TEXT,               -- JSON: { "A1": 5, "A2": 3, ... }

  -- Streak info
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date TEXT,               -- YYYY-MM-DD

  -- Recent history (JSON)
  recent_scores TEXT,                    -- JSON array of recent scores

  -- Timestamps
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_writing_stats_updated_at ON writing_stats(updated_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_writing_stats_updated_at
AFTER UPDATE ON writing_stats
FOR EACH ROW
BEGIN
  UPDATE writing_stats SET updated_at = unixepoch('now') * 1000 WHERE user_id = NEW.user_id;
END;
