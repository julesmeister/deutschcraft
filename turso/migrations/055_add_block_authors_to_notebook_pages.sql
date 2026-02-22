-- Add block_authors JSON column for tracking per-block edit attribution
-- Structure: { "blockId": { "userId": "...", "userName": "...", "at": 1234567890 } }
ALTER TABLE notebook_pages ADD COLUMN block_authors TEXT DEFAULT '{}';
