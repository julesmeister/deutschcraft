-- Migration: 051_create_preposition_cases_progress_table
-- Description: Track correct answer counts for Preposition Cases game per user per preposition
-- Created: 2026-02-16

CREATE TABLE IF NOT EXISTS preposition_cases_progress (
  id TEXT PRIMARY KEY NOT NULL,              -- Format: {userId}_{preposition} e.g. "user@test.com_für"
  user_id TEXT NOT NULL,
  preposition TEXT NOT NULL,                 -- e.g. "für"
  correct_case TEXT NOT NULL,                -- e.g. "Akkusativ"
  correct_count INTEGER DEFAULT 0,
  last_correct_at INTEGER,                   -- Unix timestamp ms
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_preposition_cases_progress_user_id ON preposition_cases_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_preposition_cases_progress_user_prep ON preposition_cases_progress(user_id, preposition);

CREATE TRIGGER IF NOT EXISTS trigger_preposition_cases_progress_updated_at
AFTER UPDATE ON preposition_cases_progress
FOR EACH ROW
BEGIN
  UPDATE preposition_cases_progress SET updated_at = unixepoch('now') * 1000 WHERE id = NEW.id;
END;
