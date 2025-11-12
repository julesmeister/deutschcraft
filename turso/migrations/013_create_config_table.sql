-- Migration: 013_create_config_table
-- Description: Create config table for key-value configuration storage (pricing, etc.)
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS config (
  -- Primary Key
  key TEXT PRIMARY KEY NOT NULL,

  -- Value (stored as JSON)
  value TEXT NOT NULL,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- Index for updated_at
CREATE INDEX IF NOT EXISTS idx_config_updated_at ON config(updated_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_config_updated_at
AFTER UPDATE ON config
FOR EACH ROW
BEGIN
  UPDATE config SET updated_at = unixepoch('now') * 1000 WHERE key = NEW.key;
END;

-- Insert default pricing config (optional)
-- This ensures the pricing service has data even on first run
INSERT OR IGNORE INTO config (key, value, created_at, updated_at)
VALUES (
  'course-pricing',
  '{"levels":{},"currency":"PHP","currencySymbol":"₱","updatedAt":' || (unixepoch('now') * 1000) || ',"updatedBy":"system"}',
  unixepoch('now') * 1000,
  unixepoch('now') * 1000
);
