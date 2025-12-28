-- Migration: 030_create_grammar_reviews_table
-- Description: Create grammar reviews table for SRS tracking
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS grammar_reviews (
  -- Primary Key
  review_id TEXT PRIMARY KEY NOT NULL,    -- Format: {userId}_{sentenceId}

  -- References
  user_id TEXT NOT NULL,                  -- Student's email
  sentence_id TEXT NOT NULL,              -- Reference to grammar sentence
  rule_id TEXT NOT NULL,                  -- Reference to grammar rule
  level TEXT NOT NULL,                    -- CEFR level

  -- SRS (Spaced Repetition System) data
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,             -- days until next review
  next_review_date INTEGER,               -- Unix timestamp

  -- Performance tracking
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  consecutive_incorrect INTEGER DEFAULT 0,
  mastery_level INTEGER DEFAULT 0,        -- 0-100
  last_review_date INTEGER,               -- Unix timestamp

  -- Last attempt details (stored as JSON)
  last_attempt TEXT,                      -- JSON: {userAnswer, correctAnswer, difficulty, timestamp}

  -- Timestamps
  first_seen_at INTEGER,                  -- Unix timestamp
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),

  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (sentence_id) REFERENCES grammar_sentences(sentence_id) ON DELETE CASCADE,
  FOREIGN KEY (rule_id) REFERENCES grammar_rules(rule_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_grammar_reviews_user_id ON grammar_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_grammar_reviews_sentence_id ON grammar_reviews(sentence_id);
CREATE INDEX IF NOT EXISTS idx_grammar_reviews_rule_id ON grammar_reviews(rule_id);
CREATE INDEX IF NOT EXISTS idx_grammar_reviews_level ON grammar_reviews(level);
CREATE INDEX IF NOT EXISTS idx_grammar_reviews_next_review ON grammar_reviews(next_review_date);
CREATE INDEX IF NOT EXISTS idx_grammar_reviews_mastery ON grammar_reviews(mastery_level);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS trigger_grammar_reviews_updated_at
AFTER UPDATE ON grammar_reviews
FOR EACH ROW
BEGIN
  UPDATE grammar_reviews SET updated_at = unixepoch('now') * 1000 WHERE review_id = NEW.review_id;
END;
