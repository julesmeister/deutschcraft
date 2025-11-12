-- Migration: 010_create_writing_submissions_table
-- Description: Create writing submissions table for exercise attempts
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS writing_submissions (
  -- Primary Key
  submission_id TEXT PRIMARY KEY NOT NULL,

  -- References
  exercise_id TEXT NOT NULL,
  user_id TEXT NOT NULL,                  -- Student's email
  exercise_type TEXT NOT NULL,
  level TEXT NOT NULL,

  -- Multiple attempts support
  attempt_number INTEGER DEFAULT 1,

  -- Submission content
  content TEXT NOT NULL,                  -- Student's writing
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,

  -- For translation exercises
  original_text TEXT,                     -- English text (for translations)

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),

  -- Timestamps
  started_at INTEGER NOT NULL,
  submitted_at INTEGER,
  last_saved_at INTEGER NOT NULL,

  -- AI Feedback (stored as JSON)
  ai_feedback TEXT,                       -- JSON: full WritingFeedback object

  -- Manual feedback (teacher)
  teacher_feedback TEXT,
  teacher_score INTEGER,                  -- 0-100
  reviewed_by TEXT,                       -- Teacher's email
  reviewed_at INTEGER,

  -- Version history (stored as JSON)
  version INTEGER DEFAULT 1,
  previous_versions TEXT,                 -- JSON array: [{version, content, wordCount, savedAt, editedBy, changes}]

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (exercise_id) REFERENCES writing_exercises(exercise_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_writing_submissions_exercise_id ON writing_submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_id ON writing_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_status ON writing_submissions(status);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_exercise_type ON writing_submissions(exercise_type);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_level ON writing_submissions(level);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_submitted_at ON writing_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_exercise ON writing_submissions(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_created_at ON writing_submissions(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_writing_submissions_updated_at
AFTER UPDATE ON writing_submissions
FOR EACH ROW
BEGIN
  UPDATE writing_submissions SET updated_at = unixepoch('now') * 1000 WHERE submission_id = NEW.submission_id;
END;
