-- ============================================================================
-- Social Suggestions Table
-- Path: suggestions/{suggestionId}
-- Grammar/vocabulary corrections for posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_suggestions (
  suggestion_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  suggested_by TEXT NOT NULL, -- Email of user who suggested
  suggested_to TEXT NOT NULL, -- Email of post author

  -- Original and suggested text
  original_text TEXT NOT NULL, -- The text that needs correction
  suggested_text TEXT NOT NULL, -- The corrected version

  -- Context
  explanation TEXT, -- Why this correction is better
  grammar_rule TEXT, -- Which grammar rule applies
  position_start INTEGER, -- Location in the post
  position_end INTEGER,

  -- Type of suggestion
  type TEXT NOT NULL CHECK(type IN ('grammar', 'vocabulary', 'spelling', 'style', 'other')),
  severity TEXT NOT NULL CHECK(severity IN ('critical', 'important', 'suggestion')),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'applied')),
  accepted_at INTEGER,

  -- Engagement (other users can upvote good suggestions)
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  FOREIGN KEY (post_id) REFERENCES social_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (suggested_by) REFERENCES users(user_id),
  FOREIGN KEY (suggested_to) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_suggestions_post_id ON social_suggestions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_suggestions_suggested_by ON social_suggestions(suggested_by);
CREATE INDEX IF NOT EXISTS idx_social_suggestions_suggested_to ON social_suggestions(suggested_to);
CREATE INDEX IF NOT EXISTS idx_social_suggestions_status ON social_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_social_suggestions_upvotes ON social_suggestions(upvotes DESC);
