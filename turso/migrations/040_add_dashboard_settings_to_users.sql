
-- Migration: 040_add_dashboard_settings_and_name_to_users
-- Description: Add dashboard_settings column to users table and ensure name column exists (optional, but good for caching)
-- Created: 2025-01-03

ALTER TABLE users ADD COLUMN dashboard_settings TEXT;
-- We are NOT adding name column to avoid data duplication, logic should handle first_name + last_name
