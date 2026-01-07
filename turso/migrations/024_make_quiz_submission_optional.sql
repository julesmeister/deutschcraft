-- Migration: 024_make_quiz_submission_optional
-- Description: Make submission_id optional for practice quizzes
-- Created: 2025-01-07

-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- 1. Create new table with nullable submission_id
CREATE TABLE IF NOT EXISTS writing_review_quizzes_new (
  -- Primary Key
  quiz_id TEXT PRIMARY KEY NOT NULL,

  -- References
  submission_id TEXT,                    -- Optional: NULL for practice quizzes
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,

  -- Quiz Content
  exercise_type TEXT NOT NULL,           -- e.g., 'email', 'creative', 'translation', 'practice'
  source_type TEXT NOT NULL,             -- 'ai', 'teacher', or 'reference'
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  blanks TEXT NOT NULL,                  -- JSON array of QuizBlank objects

  -- Student Responses
  answers TEXT,                          -- JSON object: { blankIndex: studentAnswer }
  score INTEGER NOT NULL DEFAULT 0,      -- Points earned
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_blanks INTEGER NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'in-progress',  -- 'in-progress' or 'completed'
  started_at INTEGER NOT NULL,
  completed_at INTEGER,

  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  -- Foreign Keys (submission_id is now optional)
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 2. Copy existing data
INSERT INTO writing_review_quizzes_new
SELECT * FROM writing_review_quizzes;

-- 3. Drop old table
DROP TABLE writing_review_quizzes;

-- 4. Rename new table
ALTER TABLE writing_review_quizzes_new RENAME TO writing_review_quizzes;

-- 5. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_review_quizzes_user_id ON writing_review_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_submission_id ON writing_review_quizzes(submission_id);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_status ON writing_review_quizzes(status);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_created_at ON writing_review_quizzes(created_at);
CREATE INDEX IF NOT EXISTS idx_review_quizzes_user_status ON writing_review_quizzes(user_id, status);
