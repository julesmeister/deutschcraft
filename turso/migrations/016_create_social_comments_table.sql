-- ============================================================================
-- Social Comments Table
-- Path: comments/{commentId}
-- Comments on posts with nested reply support
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_comments (
  comment_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL, -- Which post this belongs to
  user_id TEXT NOT NULL, -- Email of commenter
  parent_comment_id TEXT, -- For nested replies (NULL for top-level comments)

  -- Content
  content TEXT NOT NULL,

  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (parent_comment_id) REFERENCES social_comments(comment_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent_id ON social_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_created_at ON social_comments(created_at ASC);
