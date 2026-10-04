// CSV for Excel: UTF-8 with a byte-order mark, CRLF line endings, and
// protection against formula injection. Visitors type names, emails and
// messages, and Excel runs a cell starting with = + - @ (or tab/CR) as a
// formula, so such text cells get a leading apostrophe. Numbers are untouched.
const formulaStart = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && formulaStart.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const lines = [columns, ...rows.map((row) => columns.map((c) => row[c]))];
  return (
    '﻿' + lines.map((line) => line.map(cell).join(',')).join('\r\n') + '\r\n'
  );
}
