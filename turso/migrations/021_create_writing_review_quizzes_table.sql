-- Migration: 021_create_writing_review_quizzes_table
-- Description: Create writing review quizzes table for fill-in-the-blank correction reviews
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS writing_review_quizzes (
  -- Primary Key
  quiz_id TEXT PRIMARY KEY NOT NULL,

  -- References
  submission_id TEXT NOT NULL,           -- Original writing submission
  user_id TEXT NOT NULL,                 -- Student taking quiz
  exercise_id TEXT NOT NULL,             -- Exercise ID
  exercise_type TEXT NOT NULL,           -- WritingExerciseType

  -- Quiz source
  source_type TEXT NOT NULL CHECK (source_type IN ('ai', 'teacher', 'reference')),

  -- Quiz content (stored as JSON for flexibility)
  original_text TEXT NOT NULL,           -- Student's original text
  corrected_text TEXT NOT NULL,          -- The correction being tested
  blanks TEXT NOT NULL,                  -- JSON array of QuizBlank objects

  -- Student's answers
  answers TEXT,                          -- JSON object: blankIndex -> answer

  -- Scoring
  score INTEGER DEFAULT 0,               -- 0-100
  correct_answers INTEGER DEFAULT 0,
  total_blanks INTEGER NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed')),

  -- Timestamps
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES writing_submissions(submission_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_review_quizzes_user_id ON writing_review_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_submission_id ON writing_review_quizzes(submission_id);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_status ON writing_review_quizzes(status);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_created_at ON writing_review_quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_user_status ON writing_review_quizzes(user_id, status);
