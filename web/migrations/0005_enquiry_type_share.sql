-- Optional 16-type result attached to a contact-form enquiry.
-- Written only for types.drelijah.org when the person opted in (share_type=1).
-- Never written for anonymous test-takers, and never written without that opt-in.
-- type_code is a four-letter code (E/I, S/N, T/F, J/P). type_detail is short
-- free text such as dimension leanings, at most 500 characters.
ALTER TABLE enquiries ADD COLUMN type_code TEXT
  CHECK (
    type_code IS NULL
    OR type_code GLOB '[EI][NS][TF][JP]'
  );
ALTER TABLE enquiries ADD COLUMN type_detail TEXT
  CHECK (type_detail IS NULL OR length(type_detail) <= 500);

-- The admin types list filters on this prefix (types.drelijah.org/…).
CREATE INDEX IF NOT EXISTS enquiries_source_page ON enquiries (source_page);
