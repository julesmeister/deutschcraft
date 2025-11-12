-- Migration: 007_create_tasks_table
-- Description: Create writing tasks table for teacher assignments
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS tasks (
  -- Primary Key
  task_id TEXT PRIMARY KEY NOT NULL,

  -- References
  batch_id TEXT NOT NULL,                 -- Which batch this task belongs to
  teacher_id TEXT NOT NULL,               -- Email of teacher who created it

  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,

  -- Classification
  category TEXT NOT NULL CHECK (category IN ('essay', 'letter', 'email', 'story', 'article', 'report', 'review', 'other')),
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Status and priority
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'assigned', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

  -- Timing
  assigned_date INTEGER,                  -- Unix timestamp
  due_date INTEGER NOT NULL,              -- Unix timestamp
  estimated_duration INTEGER,             -- minutes

  -- Assignment tracking (stored as JSON arrays)
  assigned_students TEXT,                 -- JSON array of student emails
  completed_students TEXT,                -- JSON array of student emails who completed

  -- Requirements
  min_words INTEGER,
  max_words INTEGER,
  min_paragraphs INTEGER,
  max_paragraphs INTEGER,
  required_vocabulary TEXT,               -- JSON array of required words
  total_points INTEGER,

  -- Writing criteria
  require_introduction BOOLEAN DEFAULT false,
  require_conclusion BOOLEAN DEFAULT false,
  require_examples BOOLEAN DEFAULT false,
  tone TEXT,                              -- formell, informell, sachlich, persönlich, offiziell
  perspective TEXT,                       -- first-person, second-person, third-person

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_teacher_id ON tasks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_level ON tasks(level);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_tasks_updated_at
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
  UPDATE tasks SET updated_at = unixepoch('now') * 1000 WHERE task_id = NEW.task_id;
END;
