-- Migration: 004_create_flashcards_table
-- Description: Create flashcards table for vocabulary practice
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS flashcards (
  -- Primary Key
  id TEXT PRIMARY KEY NOT NULL,

  -- Word reference
  word_id TEXT NOT NULL,

  -- Flashcard details
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT NOT NULL,            -- JSON array of incorrect options

  -- Classification
  type TEXT NOT NULL CHECK (type IN ('translation', 'fill-in-blank', 'multiple-choice')),
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (word_id) REFERENCES vocabulary(word_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flashcards_word_id ON flashcards(word_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_level ON flashcards(level);
CREATE INDEX IF NOT EXISTS idx_flashcards_type ON flashcards(type);
CREATE INDEX IF NOT EXISTS idx_flashcards_created_at ON flashcards(created_at);
