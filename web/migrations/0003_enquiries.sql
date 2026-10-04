-- Scoping-call requests from the contact form on drelijah.org.
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT,
  need TEXT NOT NULL,
  size TEXT,
  hrd_corp TEXT,
  phone TEXT,
  message TEXT,
  -- The drelijah.org page the visitor came from, e.g. /prisma.
  source_page TEXT,
  notice_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS enquiries_email ON enquiries (email);
