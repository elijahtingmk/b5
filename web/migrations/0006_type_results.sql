-- Anonymous completed 16-type tests from types.drelijah.org.
-- One row per completed test. `id` is 24 lowercase hex characters, the same
-- shape as Big Five result ids from newId(). No name, email, organisation,
-- or other identity is stored. A person is linked only if they later submit
-- the contact form, opt in (share_type = 1), and send this id.
CREATE TABLE IF NOT EXISTS type_results (
  id TEXT PRIMARY KEY CHECK (
    length(id) = 24
    AND id NOT GLOB '*[^0-9a-f]*'
  ),
  type_code TEXT NOT NULL CHECK (type_code GLOB '[EI][NS][TF][JP]'),
  type_detail TEXT CHECK (type_detail IS NULL OR length(type_detail) <= 500),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS type_results_created
  ON type_results (created_at, id);
CREATE INDEX IF NOT EXISTS type_results_type_code ON type_results (type_code);

-- Written on an enquiry only when the person opted in. Otherwise left null.
ALTER TABLE enquiries ADD COLUMN type_result_id TEXT
  CHECK (
    type_result_id IS NULL
    OR (
      length(type_result_id) = 24
      AND type_result_id NOT GLOB '*[^0-9a-f]*'
    )
  );
