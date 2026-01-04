-- ============================================================================
-- Add media_urls column to social_posts table
-- Stores image/video URLs as JSON array
-- ============================================================================

ALTER TABLE social_posts ADD COLUMN media_urls TEXT;
