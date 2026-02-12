-- Migration: 047_create_pacman_verb_progress_table
-- Description: Track correct answer counts for Pacman prefix game per user per verb
-- Created: 2026-02-12

CREATE TABLE IF NOT EXISTS pacman_verb_progress (
  id TEXT PRIMARY KEY NOT NULL,              -- Format: {userId}_{verbFull} e.g. "user@test.com_abschreiben"
  user_id TEXT NOT NULL,
  verb_full TEXT NOT NULL,                   -- e.g. "abschreiben"
  verb_root TEXT NOT NULL,                   -- e.g. "schreiben"
  verb_prefix TEXT NOT NULL,                 -- e.g. "ab-"
  meaning TEXT NOT NULL,                     -- e.g. "to copy (writing)"
  correct_count INTEGER DEFAULT 0,
  last_correct_at INTEGER,                   -- Unix timestamp ms
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_pacman_verb_progress_user_id ON pacman_verb_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_pacman_verb_progress_verb_full ON pacman_verb_progress(verb_full);
CREATE INDEX IF NOT EXISTS idx_pacman_verb_progress_correct_count ON pacman_verb_progress(correct_count);

CREATE TRIGGER IF NOT EXISTS trigger_pacman_verb_progress_updated_at
AFTER UPDATE ON pacman_verb_progress
FOR EACH ROW
BEGIN
  UPDATE pacman_verb_progress SET updated_at = unixepoch('now') * 1000 WHERE id = NEW.id;
END;
