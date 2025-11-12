-- Migration: 008_create_submissions_table
-- Description: Create task submissions table for student work
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS submissions (
  -- Primary Key
  submission_id TEXT PRIMARY KEY NOT NULL,

  -- References
  task_id TEXT NOT NULL,                  -- Reference to task
  student_id TEXT NOT NULL,               -- Student's email
  batch_id TEXT NOT NULL,                 -- For easier querying

  -- Submission content
  content TEXT NOT NULL,                  -- The actual writing
  word_count INTEGER DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),

  -- Timestamps
  started_at INTEGER,                     -- Unix timestamp
  submitted_at INTEGER,                   -- Unix timestamp
  graded_at INTEGER,                      -- Unix timestamp

  -- Grading
  score INTEGER,                          -- Points earned
  max_score INTEGER,                      -- Total possible points
  feedback TEXT,                          -- Teacher feedback
  graded_by TEXT,                         -- Teacher's email

  -- Version tracking (stored as JSON)
  version INTEGER DEFAULT 1,
  revisions TEXT,                         -- JSON array: [{version, content, wordCount, savedAt}]

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_task_id ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_batch_id ON submissions(batch_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_submissions_updated_at
AFTER UPDATE ON submissions
FOR EACH ROW
BEGIN
  UPDATE submissions SET updated_at = unixepoch('now') * 1000 WHERE submission_id = NEW.submission_id;
END;
