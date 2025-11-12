-- Migration: 005_create_flashcard_progress_table
-- Description: Create flashcard progress table for spaced repetition tracking
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS flashcard_progress (
  -- Composite Primary Key (user_id + flashcard_id)
  id TEXT PRIMARY KEY NOT NULL,           -- Format: {userId}_{flashcardId}

  -- References
  flashcard_id TEXT NOT NULL,
  user_id TEXT NOT NULL,                  -- Student's email
  word_id TEXT NOT NULL,

  -- SRS (Spaced Repetition System) data
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,          -- 1.3 to 2.5+
  interval INTEGER DEFAULT 1,             -- days until next review
  next_review_date INTEGER,               -- Unix timestamp

  -- Performance metrics
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_review_date INTEGER,               -- Unix timestamp
  mastery_level INTEGER DEFAULT 0,        -- 0-100

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES vocabulary(word_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_flashcard_id ON flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_word_id ON flashcard_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review_date ON flashcard_progress(next_review_date);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_mastery_level ON flashcard_progress(mastery_level);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_updated_at ON flashcard_progress(updated_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_flashcard_progress_updated_at
AFTER UPDATE ON flashcard_progress
FOR EACH ROW
BEGIN
  UPDATE flashcard_progress SET updated_at = unixepoch('now') * 1000 WHERE id = NEW.id;
END;
