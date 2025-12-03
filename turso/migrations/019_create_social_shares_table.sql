-- ============================================================================
-- Social Shares Table
-- When users share posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_shares (
  share_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  shared_by TEXT NOT NULL, -- User email
  share_type TEXT NOT NULL CHECK(share_type IN ('repost', 'quote', 'external')),
  quote_text TEXT, -- If quote-sharing, what they said

  -- Timestamp
  created_at INTEGER NOT NULL,

  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_shares_post_id ON social_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_shared_by ON social_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_social_shares_created_at ON social_shares(created_at DESC);
