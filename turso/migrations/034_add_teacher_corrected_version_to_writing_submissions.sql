-- Migration: 034_add_teacher_corrected_version_to_writing_submissions
-- Description: Add teacher_corrected_version and teacher_corrected_at columns to writing_submissions table
-- Created: 2025-12-28

ALTER TABLE writing_submissions ADD COLUMN teacher_corrected_version TEXT;
ALTER TABLE writing_submissions ADD COLUMN teacher_corrected_at INTEGER;
