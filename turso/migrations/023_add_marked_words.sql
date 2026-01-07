-- Migration: Add marked_words column to student_answers table
-- Description: Stores words that students mark for practice as JSON array
-- Created: 2026-01-07

-- Add column for storing marked words as JSON
ALTER TABLE student_answers
ADD COLUMN marked_words TEXT DEFAULT NULL;

-- Note: marked_words will store JSON array of MarkedWord objects:
-- [{"word":"Haus","startIndex":0,"endIndex":4,"markedAt":1736257200000}]
