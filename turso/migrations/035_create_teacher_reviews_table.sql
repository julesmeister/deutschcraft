-- Migration: 035_create_teacher_reviews_table
-- Description: Create teacher_reviews table for detailed feedback
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS teacher_reviews (
  -- Primary Key
  review_id TEXT PRIMARY KEY NOT NULL,

  -- References
  submission_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  
  -- Scores
  grammar_score INTEGER DEFAULT 0,
  vocabulary_score INTEGER DEFAULT 0,
  coherence_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,

  -- Content
  comments TEXT,
  corrected_version TEXT,
  
  -- Feedback details (stored as JSON)
  strengths TEXT,               -- JSON array
  areas_for_improvement TEXT,   -- JSON array
  
  -- Meta
  meets_criteria INTEGER DEFAULT 0, -- boolean
  requires_revision INTEGER DEFAULT 0, -- boolean

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (submission_id) REFERENCES writing_submissions(submission_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teacher_reviews_submission_id ON teacher_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reviews_teacher_id ON teacher_reviews(teacher_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_teacher_reviews_updated_at
AFTER UPDATE ON teacher_reviews
FOR EACH ROW
BEGIN
  UPDATE teacher_reviews SET updated_at = unixepoch('now') * 1000 WHERE review_id = NEW.review_id;
END;
