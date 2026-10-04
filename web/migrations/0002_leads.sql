-- People who opted in to be contacted from the results page.
-- Each row keeps the exact consent wording the person agreed to, so there is
-- a record of what they consented to and when.
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  locale TEXT,
  contact_consent_text TEXT NOT NULL,
  -- Only set when the person also agreed to let their result be viewed.
  result_id TEXT,
  result_consent_text TEXT,
  notice_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS leads_email ON leads (email);
