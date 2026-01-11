-- Migration: 043_create_playground_history_table
-- Description: Create playground_history table for tracking room usage statistics
-- Created: 2026-01-11

CREATE TABLE IF NOT EXISTS playground_history (
  -- Primary Key
  history_id TEXT PRIMARY KEY NOT NULL,

  -- Room information
  room_id TEXT NOT NULL,
  room_title TEXT NOT NULL,
  host_id TEXT NOT NULL,                  -- Teacher who created the room
  host_name TEXT NOT NULL,

  -- Timing
  created_at INTEGER NOT NULL,            -- Room creation timestamp (ms)
  ended_at INTEGER NOT NULL,              -- Room end timestamp (ms)
  duration_minutes INTEGER NOT NULL,      -- Total duration in minutes

  -- Participant statistics
  total_participants INTEGER NOT NULL DEFAULT 0,
  max_concurrent_participants INTEGER NOT NULL DEFAULT 0,

  -- Activity statistics
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_words_written INTEGER NOT NULL DEFAULT 0,
  voice_active_duration INTEGER DEFAULT 0,  -- Total minutes voice was active

  -- Additional metadata (stored as JSON)
  participant_list TEXT,                  -- JSON array of participant names

  -- Timestamps
  logged_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_playground_history_host_id ON playground_history(host_id);
CREATE INDEX IF NOT EXISTS idx_playground_history_created_at ON playground_history(created_at);
CREATE INDEX IF NOT EXISTS idx_playground_history_ended_at ON playground_history(ended_at);
CREATE INDEX IF NOT EXISTS idx_playground_history_room_id ON playground_history(room_id);
