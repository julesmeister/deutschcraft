-- Migration to remove foreign key constraint on post_id in social_comments
-- This allows comments to be linked to Exercises (which are not in social_posts table)

-- 1. Create new table without the Foreign Key constraint
CREATE TABLE IF NOT EXISTS social_comments_new (
  comment_id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,       -- ID of the Post or Exercise
  user_id TEXT NOT NULL,       -- Author's User ID
  parent_comment_id TEXT,      -- For nested replies (threading)
  content TEXT NOT NULL,       -- The actual comment text
  likes_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. Copy data from old table to new table
INSERT INTO social_comments_new SELECT * FROM social_comments;

-- 3. Drop old table
DROP TABLE social_comments;

-- 4. Rename new table to original name
ALTER TABLE social_comments_new RENAME TO social_comments;

-- 5. Create index on post_id for faster lookups (was implicitly created by FK before, maybe)
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON social_comments(post_id);
