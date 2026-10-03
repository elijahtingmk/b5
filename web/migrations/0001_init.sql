-- Test results. `id` keeps the 24-character hex format of the original
-- MongoDB ObjectIds so existing ID validation and links keep working.
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  invalid INTEGER NOT NULL DEFAULT 0,
  time_elapsed INTEGER NOT NULL,
  date_stamp TEXT NOT NULL,
  answers TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
