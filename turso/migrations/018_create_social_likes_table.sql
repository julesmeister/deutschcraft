-- ============================================================================
-- Social Likes Table
-- Path: likes/{likeId}
-- Likes for posts and comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_likes (
  like_id TEXT PRIMARY KEY, -- Format: {userId}_{targetId}
  user_id TEXT NOT NULL, -- Who liked
  target_id TEXT NOT NULL, -- postId or commentId
  target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),

  -- Timestamp
  created_at INTEGER NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(user_id),

  -- Unique constraint: a user can only like a target once
  UNIQUE(user_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_social_likes_user_id ON social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_target_id ON social_likes(target_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_target_type ON social_likes(target_type);
