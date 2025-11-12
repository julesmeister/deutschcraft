-- Migration: 009_create_writing_exercises_table
-- Description: Create writing exercises table for self-paced practice
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS writing_exercises (
  -- Primary Key
  exercise_id TEXT PRIMARY KEY NOT NULL,

  -- Exercise type
  type TEXT NOT NULL CHECK (type IN ('creative', 'translation', 'guided', 'descriptive', 'dialogue', 'formal-letter', 'informal-letter', 'email', 'essay')),
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Common fields
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time INTEGER DEFAULT 30,      -- minutes

  -- Translation-specific fields
  english_text TEXT,                      -- Text to translate (for translation exercises)
  correct_german_text TEXT,               -- Reference translation (for translation exercises)

  -- Creative writing fields
  prompt TEXT,                            -- Writing prompt (for creative exercises)
  image_url TEXT,                         -- Optional inspiration image

  -- Requirements
  min_words INTEGER DEFAULT 50,
  max_words INTEGER,
  suggested_structure TEXT,               -- JSON array: ['Introduction', 'Main Part', 'Conclusion']

  -- Guidance
  tone TEXT,                              -- formal, informal, neutral
  target_grammar TEXT,                    -- JSON array of grammar points
  target_vocabulary TEXT,                 -- JSON array (translation) or suggested vocabulary (creative)
  hints TEXT,                             -- JSON array of hints (translation)
  suggested_vocabulary TEXT,              -- JSON array (creative writing)
  example_response TEXT,                  -- Optional example (creative writing)

  -- Statistics
  completion_count INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,          -- For translations
  average_word_count INTEGER DEFAULT 0,  -- For creative writing

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_writing_exercises_type ON writing_exercises(type);
CREATE INDEX IF NOT EXISTS idx_writing_exercises_level ON writing_exercises(level);
CREATE INDEX IF NOT EXISTS idx_writing_exercises_difficulty ON writing_exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_writing_exercises_category ON writing_exercises(category);
CREATE INDEX IF NOT EXISTS idx_writing_exercises_created_at ON writing_exercises(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_writing_exercises_updated_at
AFTER UPDATE ON writing_exercises
FOR EACH ROW
BEGIN
  UPDATE writing_exercises SET updated_at = unixepoch('now') * 1000 WHERE exercise_id = NEW.exercise_id;
END;
