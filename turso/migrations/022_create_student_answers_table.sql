-- Migration: 022_create_student_answers_table
-- Description: Create student answers table for tracking exercise responses
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS student_answers (
  -- Primary Key (composite: studentId_exerciseId_itemNumber)
  answer_id TEXT PRIMARY KEY NOT NULL,

  -- Student info
  student_id TEXT NOT NULL,              -- User email or ID
  student_name TEXT NOT NULL,            -- Display name

  -- Exercise reference
  exercise_id TEXT NOT NULL,             -- Exercise identifier (e.g., "B1.1-L1-AB-Folge1-1")
  item_number TEXT NOT NULL,             -- Item/question number (e.g., "1", "2", "a", "b")

  -- Answer data
  student_answer TEXT NOT NULL,          -- What the student wrote
  is_correct BOOLEAN,                    -- Optional: auto-grading result

  -- Timestamp
  submitted_at INTEGER NOT NULL,

  -- Foreign key constraint
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_exercise_id ON student_answers(exercise_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_submitted_at ON student_answers(submitted_at);
CREATE INDEX IF NOT EXISTS idx_student_answers_student_exercise ON student_answers(student_id, exercise_id);

-- Unique constraint to prevent duplicate answers for same item
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_answers_unique
  ON student_answers(student_id, exercise_id, item_number);
