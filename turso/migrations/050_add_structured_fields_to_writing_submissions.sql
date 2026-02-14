-- Migration: 050_add_structured_fields_to_writing_submissions
-- Description: Add structured_fields JSON column for email/letter header fields
-- Created: 2026-02-15

ALTER TABLE writing_submissions ADD COLUMN structured_fields TEXT;
