-- Migration: 002_create_batches_table
-- Description: Create batches table for organizing students into groups
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS batches (
  -- Primary Key
  batch_id TEXT PRIMARY KEY NOT NULL,

  -- Teacher relationship
  teacher_id TEXT NOT NULL,               -- Email of teacher who created it

  -- Batch details
  name TEXT NOT NULL,
  description TEXT,
  current_level TEXT NOT NULL CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  start_date INTEGER NOT NULL,            -- Unix timestamp
  end_date INTEGER,                       -- Unix timestamp, nullable for ongoing batches

  -- Stats (computed field, updated via app logic)
  student_count INTEGER DEFAULT 0,

  -- Level history (stored as JSON array)
  level_history TEXT,                     -- JSON: [{level, startDate, endDate, modifiedBy, notes}]

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_batches_teacher_id ON batches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_batches_is_active ON batches(is_active);
CREATE INDEX IF NOT EXISTS idx_batches_current_level ON batches(current_level);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_batches_updated_at
AFTER UPDATE ON batches
FOR EACH ROW
BEGIN
  UPDATE batches SET updated_at = unixepoch('now') * 1000 WHERE batch_id = NEW.batch_id;
END;
