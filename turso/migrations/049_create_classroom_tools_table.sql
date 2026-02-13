-- Classroom tools state per playground room
-- Stores all tool state as a single JSON blob for simplicity
CREATE TABLE IF NOT EXISTS classroom_tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL UNIQUE,
  tool_state TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_classroom_tools_room ON classroom_tools(room_id);
