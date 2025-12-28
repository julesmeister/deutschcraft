-- Migration: 025_create_mini_exercise_tables
-- Description: Create mini exercise tables for sentence-level practice
-- Created: 2025-12-28

-- Mini Exercise Sentences (tracks individual sentences)
CREATE TABLE IF NOT EXISTS mini_exercise_sentences (
  -- Primary Key
  sentence_id TEXT PRIMARY KEY NOT NULL,

  -- References
  submission_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Sentence data
  sentence TEXT NOT NULL,
  original_sentence TEXT NOT NULL,
  sentence_index INTEGER NOT NULL,

  -- Source info
  exercise_id TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  exercise_title TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('ai', 'teacher', 'reference')),
  submitted_at INTEGER NOT NULL,

  -- Practice stats
  times_shown INTEGER DEFAULT 0,
  times_completed INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_blanks INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_shown_at INTEGER,
  last_completed_at INTEGER,

  -- Performance
  average_accuracy REAL DEFAULT 0,        -- 0-100
  consecutive_correct INTEGER DEFAULT 0,
  needs_review BOOLEAN DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES writing_submissions(submission_id) ON DELETE CASCADE
);

-- Mini Exercise Attempts (tracks each practice attempt)
CREATE TABLE IF NOT EXISTS mini_exercise_attempts (
  -- Primary Key
  attempt_id TEXT PRIMARY KEY NOT NULL,

  -- References
  sentence_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Attempt data
  answers TEXT NOT NULL,                  -- JSON: blankIndex -> answer
  correct_answers INTEGER NOT NULL,
  total_blanks INTEGER NOT NULL,
  points INTEGER NOT NULL,
  accuracy REAL NOT NULL,                 -- 0-100

  -- Timing
  completed_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign keys
  FOREIGN KEY (sentence_id) REFERENCES mini_exercise_sentences(sentence_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Mini Exercise Progress (user aggregate stats)
CREATE TABLE IF NOT EXISTS mini_exercise_progress (
  -- Primary Key
  user_id TEXT PRIMARY KEY NOT NULL,

  -- Overall stats
  total_sentences_practiced INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  average_accuracy REAL DEFAULT 0,

  -- Current session
  current_streak INTEGER DEFAULT 0,
  last_practice_date INTEGER,
  practice_goal INTEGER DEFAULT 10,
  today_progress INTEGER DEFAULT 0,

  -- Smart review
  sentences_due_for_review INTEGER DEFAULT 0,
  sentences_mastered INTEGER DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for mini_exercise_sentences
CREATE INDEX IF NOT EXISTS idx_mini_sentences_user ON mini_exercise_sentences(user_id);
CREATE INDEX IF NOT EXISTS idx_mini_sentences_submission ON mini_exercise_sentences(submission_id);
CREATE INDEX IF NOT EXISTS idx_mini_sentences_needs_review ON mini_exercise_sentences(needs_review);
CREATE INDEX IF NOT EXISTS idx_mini_sentences_user_needs_review ON mini_exercise_sentences(user_id, needs_review);

-- Indexes for mini_exercise_attempts
CREATE INDEX IF NOT EXISTS idx_mini_attempts_sentence ON mini_exercise_attempts(sentence_id);
CREATE INDEX IF NOT EXISTS idx_mini_attempts_user ON mini_exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_mini_attempts_completed_at ON mini_exercise_attempts(completed_at);
