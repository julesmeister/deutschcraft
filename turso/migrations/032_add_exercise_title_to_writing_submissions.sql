-- Migration: 032_add_exercise_title_to_writing_submissions
-- Description: Add exercise_title column to writing_submissions table
-- Created: 2025-12-28

ALTER TABLE writing_submissions ADD COLUMN exercise_title TEXT;
