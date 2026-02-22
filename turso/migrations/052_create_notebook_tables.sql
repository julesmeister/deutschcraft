-- Migration: 052_create_notebook_tables
-- Description: Create notebook_pages and notebook_entries tables for collaborative notebook widget
-- Created: 2026-02-22

CREATE TABLE IF NOT EXISTS notebook_pages (
  page_id TEXT PRIMARY KEY NOT NULL,
  level TEXT NOT NULL,              -- 'A1', 'A2', 'B1', 'B2'
  title TEXT NOT NULL,
  content TEXT DEFAULT '{}',        -- Tiptap JSON (teacher's main content)
  page_order INTEGER NOT NULL,
  created_by TEXT NOT NULL,         -- teacher userId
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_notebook_pages_level ON notebook_pages(level, page_order);

CREATE TRIGGER IF NOT EXISTS trigger_notebook_pages_updated_at
AFTER UPDATE ON notebook_pages
FOR EACH ROW
BEGIN
  UPDATE notebook_pages SET updated_at = unixepoch('now') * 1000 WHERE page_id = NEW.page_id;
END;

CREATE TABLE IF NOT EXISTS notebook_entries (
  entry_id TEXT PRIMARY KEY NOT NULL,
  page_id TEXT NOT NULL,
  level TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT DEFAULT '{}',        -- Tiptap JSON
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  reviewed_at INTEGER,
  reviewed_by TEXT,
  FOREIGN KEY (page_id) REFERENCES notebook_pages(page_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notebook_entries_page ON notebook_entries(page_id, status);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_level ON notebook_entries(level);
