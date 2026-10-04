// Export results or leads from D1 to a CSV file that opens in Excel.
//
//   pnpm run export:results            -> results.csv (live database)
//   pnpm run export:leads              -> leads.csv   (live database)
//   add -- --local to read the local development database instead
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const domainScore = (domain, name) =>
  `SUM(CASE WHEN json_extract(a.value, '$.domain') = '${domain}' ` +
  `THEN json_extract(a.value, '$.score') END) AS ${name}`;

// Domain scores are plain sums of the stored (already reverse-keyed) answers,
// the same way the site calculates them. Each ranges from 24 to 120.
// Keep in step with src/lib/exports.ts.
const queries = {
  results: `SELECT r.id, r.date_stamp, r.lang, r.time_elapsed AS seconds,
      ${domainScore('O', 'openness')},
      ${domainScore('C', 'conscientiousness')},
      ${domainScore('E', 'extraversion')},
      ${domainScore('A', 'agreeableness')},
      ${domainScore('N', 'neuroticism')}
    FROM results r, json_each(r.answers) a
    GROUP BY r.id ORDER BY r.date_stamp DESC`,
  leads: `SELECT l.created_at, l.name, l.email, l.role, l.locale, l.result_id,
      l.notice_version, l.contact_consent_text, l.result_consent_text
    FROM leads l ORDER BY l.created_at DESC`,
  feedback: `SELECT created_at, name, email, message
    FROM feedback ORDER BY created_at DESC`
};

const [table, ...flags] = process.argv.slice(2);
if (!queries[table]) {
  console.error(
    `Usage: export-csv.mjs <${Object.keys(queries).join('|')}> [--local]`
  );
  process.exit(1);
}
const where = flags.includes('--local') ? '--local' : '--remote';

const output = execFileSync(
  'npx',
  [
    'wrangler',
    'd1',
    'execute',
    'DB',
    where,
    '--json',
    '--command',
    queries[table]
  ],
  {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 512,
    stdio: ['ignore', 'pipe', 'inherit']
  }
);
const rows = JSON.parse(output)[0].results;

// Excel runs text starting with = + - @ (or tab/CR) as a formula. Visitors
// type names and messages, so such text cells get a leading apostrophe.
// Same rules as src/lib/csv.ts.
const cell = (value) => {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const columns = rows.length ? Object.keys(rows[0]) : [];
const csv = [columns, ...rows.map((row) => columns.map((c) => row[c]))]
  .map((line) => line.map(cell).join(','))
  .join('\r\n');

const file = `${table}.csv`;
// Leading byte-order mark so Excel reads names in any language correctly.
writeFileSync(file, '﻿' + csv + '\r\n');
console.log(`Wrote ${rows.length} rows to ${file}`);
