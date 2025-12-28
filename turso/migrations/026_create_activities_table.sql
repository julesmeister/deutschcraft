-- Migration: 026_create_activities_table
-- Description: Create activities table for student activity tracking
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS activities (
  -- Primary Key
  activity_id TEXT PRIMARY KEY NOT NULL,

  -- User info
  student_email TEXT NOT NULL,
  student_name TEXT,

  -- Activity type
  type TEXT NOT NULL CHECK (type IN (
    'flashcard_created',
    'flashcard_reviewed',
    'writing_submitted',
    'writing_reviewed',
    'level_changed',
    'streak_milestone',
    'login',
    'practice_session'
  )),

  -- Timestamp
  timestamp INTEGER NOT NULL,

  -- Metadata (stored as JSON)
  metadata TEXT,                          -- JSON object with activity-specific data

  -- Foreign key
  FOREIGN KEY (student_email) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_student ON activities(student_email);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_activities_student_type ON activities(student_email, type);
CREATE INDEX IF NOT EXISTS idx_activities_student_timestamp ON activities(student_email, timestamp DESC);
