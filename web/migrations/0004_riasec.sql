-- Results of the career interest checklist (O*NET Interest Profiler Short
-- Form). `answers` holds 60 characters of 0/1, one per activity in the order
-- of src/config/riasec.ts; the six scores (0-10) are stored for easy export.
CREATE TABLE IF NOT EXISTS riasec_results (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  form_version TEXT NOT NULL,
  time_elapsed INTEGER NOT NULL,
  answers TEXT NOT NULL,
  realistic INTEGER NOT NULL,
  investigative INTEGER NOT NULL,
  artistic INTEGER NOT NULL,
  social INTEGER NOT NULL,
  enterprising INTEGER NOT NULL,
  conventional INTEGER NOT NULL
);

-- Which test a shared result_id belongs to. Older rows (NULL) are Big Five.
ALTER TABLE leads ADD COLUMN result_test TEXT;
