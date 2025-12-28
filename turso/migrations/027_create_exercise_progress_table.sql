-- Migration: 027_create_exercise_progress_table
-- Description: Create exercise progress tracking tables
-- Created: 2025-12-28

-- Exercise Progress (individual exercise tracking)
CREATE TABLE IF NOT EXISTS exercise_progress (
  -- Primary Key (composite)
  progress_id TEXT PRIMARY KEY NOT NULL,  -- Format: {studentId}_{exerciseId}

  -- References
  exercise_id TEXT NOT NULL,
  student_id TEXT NOT NULL,

  -- Progress
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  items_completed INTEGER DEFAULT 0,
  total_items INTEGER NOT NULL,

  -- Timestamps
  last_attempted_at INTEGER NOT NULL,
  completed_at INTEGER,

  -- Foreign key
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Lesson Progress (aggregate lesson-level tracking)
CREATE TABLE IF NOT EXISTS lesson_progress (
  -- Primary Key (composite)
  progress_id TEXT PRIMARY KEY NOT NULL,  -- Format: {studentId}_{lessonId}

  -- References
  lesson_id TEXT NOT NULL,
  student_id TEXT NOT NULL,

  -- Progress
  exercises_completed INTEGER DEFAULT 0,
  total_exercises INTEGER NOT NULL,
  percentage REAL DEFAULT 0,              -- 0-100

  -- Timestamp
  last_activity_at INTEGER NOT NULL,

  -- Foreign key
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for exercise_progress
CREATE INDEX IF NOT EXISTS idx_exercise_progress_student ON exercise_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_progress_exercise ON exercise_progress(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_progress_status ON exercise_progress(status);
CREATE INDEX IF NOT EXISTS idx_exercise_progress_student_status ON exercise_progress(student_id, status);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_progress_unique
  ON exercise_progress(student_id, exercise_id);

-- Indexes for lesson_progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_activity ON lesson_progress(last_activity_at);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_progress_unique
  ON lesson_progress(student_id, lesson_id);
