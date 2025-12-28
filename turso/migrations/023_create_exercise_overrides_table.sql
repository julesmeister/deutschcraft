-- Migration: 023_create_exercise_overrides_table
-- Description: Create exercise overrides table for teacher customizations
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS exercise_overrides (
  -- Primary Key
  override_id TEXT PRIMARY KEY NOT NULL,  -- Format: {teacherEmail}_{exerciseId}

  -- References
  teacher_email TEXT NOT NULL,
  exercise_id TEXT NOT NULL,              -- Original or new exercise ID

  -- Override Type
  override_type TEXT NOT NULL CHECK (override_type IN ('create', 'modify', 'hide')),

  -- Context (for filtering)
  level TEXT,                             -- CEFR level
  lesson_number INTEGER,

  -- Exercise Data (JSON for 'create' type)
  exercise_data TEXT,                     -- Full exercise as JSON

  -- Modifications (JSON for 'modify' type)
  modifications TEXT,                     -- Partial changes as JSON

  -- Ordering
  display_order INTEGER,

  -- Hidden flag
  is_hidden BOOLEAN DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key
  FOREIGN KEY (teacher_email) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_overrides_teacher ON exercise_overrides(teacher_email);
CREATE INDEX IF NOT EXISTS idx_exercise_overrides_exercise ON exercise_overrides(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_overrides_level ON exercise_overrides(level);
CREATE INDEX IF NOT EXISTS idx_exercise_overrides_type ON exercise_overrides(override_type);
CREATE INDEX IF NOT EXISTS idx_exercise_overrides_teacher_level ON exercise_overrides(teacher_email, level);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_overrides_unique
  ON exercise_overrides(teacher_email, exercise_id);
