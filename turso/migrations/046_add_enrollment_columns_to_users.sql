-- Migration: 046_add_enrollment_columns_to_users
-- Description: Add enrollment tracking columns to users table
-- Created: 2026-01-23

ALTER TABLE users ADD COLUMN enrollment_status TEXT;
ALTER TABLE users ADD COLUMN enrollment_submitted_at INTEGER;
ALTER TABLE users ADD COLUMN enrollment_reviewed_at INTEGER;
ALTER TABLE users ADD COLUMN enrollment_reviewed_by TEXT;
ALTER TABLE users ADD COLUMN gcash_amount REAL;
ALTER TABLE users ADD COLUMN gcash_reference_number TEXT;
