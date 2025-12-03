-- ============================================================================
-- Social Posts Table
-- Path: posts/{postId}
-- A user's social media post in German with learning context
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_posts (
  post_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- Email of the user who created the post
  user_email TEXT NOT NULL, -- For easy querying

  -- Content
  content TEXT NOT NULL, -- The German text content
  media_type TEXT DEFAULT 'none' CHECK(media_type IN ('image', 'video', 'poll', 'none')),

  -- Language Learning Context
  cefr_level TEXT NOT NULL CHECK(cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  grammar_focus TEXT, -- JSON array of grammar points
  vocabulary_used TEXT, -- JSON array of vocabulary words

  -- Engagement Metrics
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  suggestions_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,

  -- Visibility
  visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'friends', 'class', 'teacher-only')),

  -- Status
  is_edited INTEGER NOT NULL DEFAULT 0, -- Boolean as 0/1
  has_accepted_suggestion INTEGER NOT NULL DEFAULT 0, -- Boolean as 0/1

  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  -- Indexes for common queries
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_cefr_level ON social_posts(cefr_level);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON social_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
