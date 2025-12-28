-- Migration: 024_create_saved_vocabulary_table
-- Description: Create saved vocabulary table for student word tracking
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS saved_vocabulary (
  -- Primary Key
  saved_vocab_id TEXT PRIMARY KEY NOT NULL,  -- Format: {userId}_{wordId}

  -- References
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  flashcard_id TEXT,

  -- Word data (denormalized)
  german TEXT NOT NULL,
  english TEXT NOT NULL,
  level TEXT NOT NULL,
  category TEXT,
  examples TEXT,                          -- JSON array

  -- Usage tracking
  times_used INTEGER DEFAULT 0,
  target_uses INTEGER DEFAULT 5,
  completed BOOLEAN DEFAULT 0,

  -- Timestamps
  saved_at INTEGER NOT NULL,
  last_used_at INTEGER,
  completed_at INTEGER,
  updated_at INTEGER NOT NULL,

  -- Foreign key
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_vocabulary_user ON saved_vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_vocabulary_word ON saved_vocabulary(word_id);
CREATE INDEX IF NOT EXISTS idx_saved_vocabulary_completed ON saved_vocabulary(completed);
CREATE INDEX IF NOT EXISTS idx_saved_vocabulary_user_completed ON saved_vocabulary(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_saved_vocabulary_saved_at ON saved_vocabulary(saved_at);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_vocabulary_unique
  ON saved_vocabulary(user_id, word_id);
