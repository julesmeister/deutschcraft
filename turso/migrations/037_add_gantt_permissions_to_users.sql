-- Migration: 037_add_gantt_permissions_to_users
-- Description: Add gantt edit permission columns to users table
-- Created: 2025-12-29

ALTER TABLE users ADD COLUMN gantt_edit_permission INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN gantt_edit_expires_at INTEGER;
