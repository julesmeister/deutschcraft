-- ============================================================================
-- Social Media Table
-- Stores uploaded images and videos as base64 encoded data
-- For posts with media attachments
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media (
  media_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Media Content
  media_type TEXT NOT NULL CHECK(media_type IN ('image', 'video')),
  mime_type TEXT NOT NULL, -- e.g., image/jpeg, video/mp4
  file_name TEXT,
  file_size INTEGER, -- Original file size in bytes

  -- Base64 encoded data (stored as TEXT in SQLite)
  data TEXT NOT NULL, -- Base64 encoded file data

  -- Thumbnail for videos
  thumbnail_data TEXT, -- Base64 encoded thumbnail image

  -- Metadata
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For videos, duration in seconds

  -- Timestamps
  created_at INTEGER NOT NULL,

  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_media_post_id ON social_media(post_id);
CREATE INDEX IF NOT EXISTS idx_social_media_user_id ON social_media(user_id);
