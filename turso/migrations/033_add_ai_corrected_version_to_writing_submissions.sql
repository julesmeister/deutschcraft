-- Migration: 033_add_ai_corrected_version_to_writing_submissions
-- Description: Add ai_corrected_version and ai_corrected_at columns to writing_submissions table
-- Created: 2025-12-28

ALTER TABLE writing_submissions ADD COLUMN ai_corrected_version TEXT;
ALTER TABLE writing_submissions ADD COLUMN ai_corrected_at INTEGER;
