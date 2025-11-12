-- Migration: 003_create_vocabulary_table
-- Description: Create vocabulary table for German words and phrases
-- Created: 2025-11-12

CREATE TABLE IF NOT EXISTS vocabulary (
  -- Primary Key
  word_id TEXT PRIMARY KEY NOT NULL,

  -- Word details
  german_word TEXT NOT NULL,
  english_translation TEXT NOT NULL,

  -- Classification
  part_of_speech TEXT,                    -- noun, verb, adjective, etc.
  gender TEXT,                            -- for German nouns: der, die, das
  level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),

  -- Examples and audio
  example_sentence TEXT,
  example_translation TEXT,
  audio_url TEXT,

  -- Metadata
  frequency INTEGER DEFAULT 5,            -- How common (1-10)
  tags TEXT,                              -- JSON array: ['family', 'food', etc.]

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_german_word ON vocabulary(german_word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_part_of_speech ON vocabulary(part_of_speech);
CREATE INDEX IF NOT EXISTS idx_vocabulary_frequency ON vocabulary(frequency);
CREATE INDEX IF NOT EXISTS idx_vocabulary_created_at ON vocabulary(created_at);

-- Full-text search index for German words
CREATE VIRTUAL TABLE IF NOT EXISTS vocabulary_fts USING fts5(
  word_id UNINDEXED,
  german_word,
  english_translation,
  example_sentence,
  content=vocabulary,
  content_rowid=rowid
);

-- Trigger to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS trigger_vocabulary_fts_insert
AFTER INSERT ON vocabulary
BEGIN
  INSERT INTO vocabulary_fts(rowid, word_id, german_word, english_translation, example_sentence)
  VALUES (NEW.rowid, NEW.word_id, NEW.german_word, NEW.english_translation, NEW.example_sentence);
END;

CREATE TRIGGER IF NOT EXISTS trigger_vocabulary_fts_update
AFTER UPDATE ON vocabulary
BEGIN
  UPDATE vocabulary_fts
  SET german_word = NEW.german_word,
      english_translation = NEW.english_translation,
      example_sentence = NEW.example_sentence
  WHERE rowid = NEW.rowid;
END;

CREATE TRIGGER IF NOT EXISTS trigger_vocabulary_fts_delete
AFTER DELETE ON vocabulary
BEGIN
  DELETE FROM vocabulary_fts WHERE rowid = OLD.rowid;
END;
