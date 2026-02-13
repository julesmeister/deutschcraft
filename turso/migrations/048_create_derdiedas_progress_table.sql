-- Migration: 048_create_derdiedas_progress_table
-- Description: Track correct answer counts for Der Die Das ending game per user per ending
-- Created: 2026-02-13

CREATE TABLE IF NOT EXISTS derdiedas_progress (
  id TEXT PRIMARY KEY NOT NULL,              -- Format: {userId}_{ending} e.g. "user@test.com_-ung"
  user_id TEXT NOT NULL,
  ending TEXT NOT NULL,                      -- e.g. "-ung"
  correct_article TEXT NOT NULL,             -- e.g. "die"
  correct_count INTEGER DEFAULT 0,
  last_correct_at INTEGER,                   -- Unix timestamp ms
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_derdiedas_progress_user_id ON derdiedas_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_derdiedas_progress_user_ending ON derdiedas_progress(user_id, ending);

CREATE TRIGGER IF NOT EXISTS trigger_derdiedas_progress_updated_at
AFTER UPDATE ON derdiedas_progress
FOR EACH ROW
BEGIN
  UPDATE derdiedas_progress SET updated_at = unixepoch('now') * 1000 WHERE id = NEW.id;
END;
