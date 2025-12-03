-- ============================================================================
-- Social Polls Table
-- For poll-type posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_polls (
  poll_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL UNIQUE,

  -- Poll Configuration
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of poll options
  allow_multiple_answers INTEGER NOT NULL DEFAULT 0, -- Boolean as 0/1
  expires_at INTEGER, -- NULL means no expiration
  results_visible_to TEXT NOT NULL DEFAULT 'everyone' CHECK(results_visible_to IN ('everyone', 'voters-only', 'author-only')),

  -- Timestamp
  created_at INTEGER NOT NULL,

  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE
);

-- ============================================================================
-- Poll Votes Table
-- Separate collection for tracking votes
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_poll_votes (
  vote_id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  selected_options TEXT NOT NULL, -- JSON array of optionIds

  -- Timestamp
  created_at INTEGER NOT NULL,

  FOREIGN KEY (poll_id) REFERENCES social_polls(poll_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),

  -- Unique constraint: a user can only vote once per poll
  UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_poll_votes_poll_id ON social_poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_social_poll_votes_user_id ON social_poll_votes(user_id);
