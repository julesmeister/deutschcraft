-- Migration: 045_create_materials_table
-- Description: Create materials table for PDF learning resources
-- Created: 2026-01-12

CREATE TABLE IF NOT EXISTS materials (
  -- Primary Key
  material_id TEXT PRIMARY KEY NOT NULL,

  -- File information
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,                -- Path to PDF in public/materials
  file_size INTEGER,                       -- Size in bytes

  -- Classification
  level TEXT NOT NULL CHECK (level IN ('A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'General')),
  category TEXT NOT NULL CHECK (category IN ('Textbook', 'Teaching Plan', 'Copy Template', 'Test', 'Solutions', 'Transcripts', 'Extra Materials')),
  lesson_number INTEGER,                   -- NULL for general materials

  -- Visibility
  is_public INTEGER NOT NULL DEFAULT 1,   -- 1 = public (default), 0 = private
  uploaded_by TEXT,                        -- Teacher who uploaded (user_id)

  -- Metadata
  tags TEXT,                               -- JSON array of tags
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_materials_level ON materials(level);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_is_public ON materials(is_public);
CREATE INDEX IF NOT EXISTS idx_materials_lesson ON materials(lesson_number);
CREATE INDEX IF NOT EXISTS idx_materials_uploaded_by ON materials(uploaded_by);
