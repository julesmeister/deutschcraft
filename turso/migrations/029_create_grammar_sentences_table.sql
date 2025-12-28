-- Migration: 029_create_grammar_sentences_table
-- Description: Create grammar sentences table for practice
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS grammar_sentences (
  -- Primary Key
  sentence_id TEXT PRIMARY KEY NOT NULL,

  -- References
  rule_id TEXT NOT NULL,                  -- Reference to grammar rule

  -- Sentence content
  english TEXT NOT NULL,                  -- English prompt
  german TEXT NOT NULL,                   -- Correct German answer
  level TEXT NOT NULL,                    -- CEFR level: A1, A2, B1, B2, C1, C2

  -- Optional metadata
  hints TEXT,                             -- JSON array of hints
  keywords TEXT,                          -- JSON array of key vocabulary
  difficulty INTEGER DEFAULT 5,           -- 1-10 scale

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (rule_id) REFERENCES grammar_rules(rule_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_grammar_sentences_rule_id ON grammar_sentences(rule_id);
CREATE INDEX IF NOT EXISTS idx_grammar_sentences_level ON grammar_sentences(level);
CREATE INDEX IF NOT EXISTS idx_grammar_sentences_difficulty ON grammar_sentences(difficulty);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_grammar_sentences_updated_at
AFTER UPDATE ON grammar_sentences
FOR EACH ROW
BEGIN
  UPDATE grammar_sentences SET updated_at = unixepoch('now') * 1000 WHERE sentence_id = NEW.sentence_id;
END;
