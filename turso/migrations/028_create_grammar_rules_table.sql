-- Migration: 028_create_grammar_rules_table
-- Description: Create grammar rules table
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS grammar_rules (
  -- Primary Key
  rule_id TEXT PRIMARY KEY NOT NULL,

  -- Rule details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL,                    -- CEFR level: A1, A2, B1, B2, C1, C2
  category TEXT NOT NULL,                 -- Cases, Prepositions, Verb Conjugation, etc.

  -- Optional fields
  examples TEXT,                          -- JSON array of example sentences
  explanation TEXT,                       -- Detailed explanation
  order_num INTEGER DEFAULT 0,            -- Display order (renamed from 'order' - reserved keyword)

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_grammar_rules_level ON grammar_rules(level);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_category ON grammar_rules(category);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_order ON grammar_rules(order_num);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_grammar_rules_updated_at
AFTER UPDATE ON grammar_rules
FOR EACH ROW
BEGIN
  UPDATE grammar_rules SET updated_at = unixepoch('now') * 1000 WHERE rule_id = NEW.rule_id;
END;
