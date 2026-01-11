-- Migration: 044_add_tags_to_playground_history
-- Description: Add tags column to playground_history table for syllabus content tagging
-- Created: 2026-01-11

ALTER TABLE playground_history ADD COLUMN tags TEXT DEFAULT '[]';

-- Update description: tags column stores JSON array of tag strings
-- Example: ["Lektion 1 - Guten Tag", "Personal pronouns", "Greetings"]
