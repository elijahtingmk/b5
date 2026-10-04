const domainScore = (domain: string, name: string) =>
  `SUM(CASE WHEN json_extract(a.value, '$.domain') = '${domain}' ` +
  `THEN json_extract(a.value, '$.score') END) AS ${name}`;

// Domain scores are plain sums of the stored (already reverse-keyed) answers,
// the same way the site calculates them. Each ranges from 24 to 120.
// Keep in step with scripts/export-csv.mjs.
export const exportQueries = {
  results: `SELECT r.id, r.date_stamp, r.lang, r.time_elapsed AS seconds,
      ${domainScore('O', 'openness')},
      ${domainScore('C', 'conscientiousness')},
      ${domainScore('E', 'extraversion')},
      ${domainScore('A', 'agreeableness')},
      ${domainScore('N', 'neuroticism')}
    FROM results r, json_each(r.answers) a
    GROUP BY r.id ORDER BY r.date_stamp DESC`,
  leads: `SELECT created_at, name, email, role, locale, result_id,
      notice_version, contact_consent_text, result_consent_text
    FROM leads ORDER BY created_at DESC`,
  feedback: `SELECT created_at, name, email, message
    FROM feedback ORDER BY created_at DESC`
} as const;

export type ExportTable = keyof typeof exportQueries;

export const exportTables: { id: ExportTable; label: string }[] = [
  { id: 'results', label: 'Test results (with trait scores)' },
  { id: 'leads', label: 'Enquiries (people who left their details)' },
  { id: 'feedback', label: 'Feedback messages' }
];
