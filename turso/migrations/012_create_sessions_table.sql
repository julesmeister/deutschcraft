-- Migration: 012_create_sessions_table
-- Description: Create sessions table for tracking practice sessions (NextAuth compatible)
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS sessions (
  -- Primary Key
  session_id TEXT PRIMARY KEY NOT NULL,

  -- User reference
  user_id TEXT NOT NULL,                  -- Student's email

  -- Session type
  session_type TEXT NOT NULL CHECK (session_type IN ('flashcard', 'writing', 'translation', 'grammar')),

  -- Session data (stored as JSON)
  session_data TEXT,                      -- JSON object with session-specific data

  -- Timing
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  duration INTEGER,                       -- seconds

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_type ON sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
