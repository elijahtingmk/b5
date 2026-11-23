// HTML for the password-protected /admin page. No I/O: the route loads the
// rows and passes them in. Every visitor-typed value is escaped.

export const TYPES_PAGE_LIMIT = 2000;

export type AdminDownload = { id: string; label: string };

export type TypesLeadRow = {
  created_at: string;
  name: string;
  email: string;
  organisation: string | null;
  need: string;
  message: string | null;
  type_code: string | null;
  type_detail: string | null;
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function asCount(value: number | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function formatStoredDate(value: string): string {
  const iso = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function leadMatches(
  lead: TypesLeadRow,
  query: string,
  topicLabels: Readonly<Record<string, string>>
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const topic = topicLabels[lead.need] ?? lead.need;
  return [
    lead.name,
    lead.email,
    lead.organisation,
    lead.message,
    lead.type_code,
    lead.type_detail,
    lead.need,
    topic
  ]
    .filter((part) => part)
    .join('\n')
    .toLowerCase()
    .includes(needle);
}

function mailAddress(email: string): string | null {
  if (!/^[^\s<>"']+@[^\s<>"']+\.[^\s<>"']+$/.test(email)) return null;
  return email;
}

function typeCell(lead: TypesLeadRow): string {
  if (!lead.type_code && !lead.type_detail) {
    return '<span class="muted">Not shared</span>';
  }
  const code = lead.type_code
    ? `<strong class="type" translate="no">${escapeHtml(lead.type_code)}</strong>`
    : '';
  const detail = lead.type_detail
    ? `<small>${escapeHtml(lead.type_detail)}</small>`
    : '';
  return `${code}${detail}`;
}

function leadRow(
  lead: TypesLeadRow,
  topicLabels: Readonly<Record<string, string>>
): string {
  const topic = topicLabels[lead.need] ?? lead.need;
  const email = mailAddress(lead.email);
  const emailHtml = email
    ? `<a class="mail" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`
    : escapeHtml(lead.email);
  const cells: [label: string, html: string, className?: string][] = [
    ['Date', escapeHtml(formatStoredDate(lead.created_at)), 'when'],
    ['Name', escapeHtml(lead.name), 'who'],
    ['Email', emailHtml, 'mailcell'],
    [
      'Organisation',
      lead.organisation
        ? escapeHtml(lead.organisation)
        : '<span class="muted">—</span>'
    ],
    ['Topic', escapeHtml(topic)],
    [
      'Message',
      lead.message ? escapeHtml(lead.message) : '<span class="muted">—</span>',
      'message'
    ],
    ['Type', typeCell(lead), 'code']
  ];
  const tds = cells
    .map(
      ([label, html, className]) =>
        `<td${className ? ` class="${className}"` : ''} data-label="${escapeHtml(label)}">${html}</td>`
    )
    .join('');
  return `<tr>${tds}</tr>`;
}

export function renderAdminPage(input: {
  downloads: readonly AdminDownload[];
  counts: Record<string, number | null | undefined>;
  topicLabels: Readonly<Record<string, string>>;
  typesLeads: readonly TypesLeadRow[];
  typesTotal: number;
  query: string;
  listCapped: boolean;
}): string {
  const total = asCount(input.typesTotal);
  const shown = input.typesLeads.length;
  const query = input.query.trim();
  const downloadRows = input.downloads
    .map(({ id, label }) => {
      const n = asCount(input.counts[id]);
      return `
      <li>
        <span>${escapeHtml(label)}<small>${n} record${n === 1 ? '' : 's'}</small></span>
        <a class="pill" href="/admin/export/${escapeHtml(id)}">Download CSV</a>
      </li>`;
    })
    .join('');

  let summary: string;
  if (query) {
    summary = `${shown} match${shown === 1 ? '' : 'es'}`;
  } else {
    summary = `${total} lead${total === 1 ? '' : 's'}`;
  }
  const capNote = input.listCapped
    ? ` The table holds the latest ${TYPES_PAGE_LIMIT}. The CSV has every lead.`
    : '';

  let table: string;
  if (shown === 0) {
    const empty = query
      ? 'No leads match this search.'
      : 'No leads from types.drelijah.org yet.';
    table = `<p class="empty">${empty}</p>`;
  } else {
    const rows = input.typesLeads
      .map((lead) => leadRow(lead, input.topicLabels))
      .join('');
    table = `<div class="scroll"><table>
      <thead><tr>
        <th scope="col">Date</th>
        <th scope="col">Name</th>
        <th scope="col">Email</th>
        <th scope="col">Organisation</th>
        <th scope="col">Topic</th>
        <th scope="col">Message</th>
        <th scope="col">Type</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }

  const clear = query ? '<a class="clear" href="/admin">Clear</a>' : '';

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Admin · drelijah.org</title>
<style>
  body{margin:0;background:#fbf8f3;color:#1a1714;font:16px/1.5 "Source Sans 3","Segoe UI",system-ui,sans-serif}
  main{max-width:72rem;margin:0 auto;padding:2.5rem 1.25rem 3rem}
  h1{font:600 1.8rem Georgia,serif;margin:0 0 .25rem}
  h1 span,h2 span{color:#c4964a}
  h2{font:600 1.35rem Georgia,serif;margin:0}
  p{color:#5a544c;margin:.25rem 0 0}
  .lead{margin:0 0 2rem}
  section{margin:0 0 2.5rem}
  .head{display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}
  form.find{display:flex;flex-wrap:wrap;gap:.6rem .75rem;align-items:flex-end;margin:0 0 1rem}
  label.find{display:flex;flex:1 1 18rem;flex-direction:column;gap:.2rem;max-width:24rem;color:#746d63;font-size:.85rem}
  input[type=search]{box-sizing:border-box;width:100%;font:inherit;color:#1a1714;padding:.55rem 1rem;border:1px solid #ddd5c7;border-radius:999px;background:#fff}
  button,a.pill{background:#0c1424;color:#f6f2ea;text-decoration:none;padding:.55rem 1rem;border-radius:999px;border:0;font:inherit;cursor:pointer;white-space:nowrap}
  button:hover,a.pill:hover{background:#1c2a40}
  a.clear{color:#0c1424;margin-left:.25rem}
  .meta{color:#746d63;font-size:.9rem;margin:.75rem 0}
  .scroll{overflow-x:auto;border-top:1px solid #ddd5c7}
  table{width:100%;border-collapse:collapse;font-size:.95rem}
  th,td{text-align:left;vertical-align:top;padding:.75rem .9rem .75rem 0;border-bottom:1px solid #ddd5c7}
  th{color:#746d63;font-size:.78rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase}
  td.when,td.who,td.mailcell,td.code{white-space:nowrap}
  td.message{white-space:pre-wrap;min-width:12rem;max-width:22rem;overflow-wrap:anywhere}
  strong.type{color:#8a6230;letter-spacing:.06em}
  td.code small{display:block;margin-top:.15rem;color:#5a544c;font-weight:400;letter-spacing:0;white-space:pre-wrap;max-width:16rem}
  a.mail{color:#0c1424;font-weight:600}
  .muted{color:#746d63}
  .empty{padding:1rem 0;border-top:1px solid #ddd5c7;border-bottom:1px solid #ddd5c7}
  ul{list-style:none;padding:0;margin:1rem 0 0;border-top:1px solid #ddd5c7}
  li{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid #ddd5c7}
  li span small{display:block;color:#746d63;font-weight:400}
  footer{margin-top:.5rem;font-size:.9rem;color:#746d63}
  @media (max-width:720px){
    thead{display:none}
    tr{display:block;padding:.85rem 0;border-bottom:1px solid #ddd5c7}
    td{display:block;border:0;padding:.1rem 0 .45rem;white-space:normal;max-width:none}
    td::before{content:attr(data-label);display:block;color:#746d63;font-size:.72rem;font-weight:600;letter-spacing:.03em;text-transform:uppercase}
    td.message{min-width:0}
  }
</style></head>
<body><main>
  <h1>drelijah<span>.org</span> admin</h1>
  <p class="lead">Downloads and the table below contain personal data. Keep them off shared drives and delete copies when you are done.</p>
  <section>
    <div class="head">
      <div>
        <h2>types<span>.drelijah.org</span> leads</h2>
        <p>Contact form submissions from the 16-type site. A result is stored only when the person opted in to share it. Otherwise the type column says Not shared.</p>
      </div>
      <a class="pill" href="/admin/export/types">Download CSV</a>
    </div>
    <form class="find" method="get" action="/admin">
      <label class="find">Find a lead
        <input type="search" name="q" value="${escapeHtml(query)}" maxlength="100" autocomplete="off" placeholder="Name, email, or type">
      </label>
      <button type="submit">Search</button>
      ${clear}
    </form>
    <p class="meta">${escapeHtml(summary)}.${escapeHtml(capNote)} Dates are Malaysia time.</p>
    ${table}
  </section>
  <section>
    <h2>Downloads</h2>
    <p>Files open in Excel. The contact-form file includes drelijah.org and types.drelijah.org. The types file is only the types site.</p>
    <ul>${downloadRows}</ul>
  </section>
  <footer>To sign out, close this browser window.</footer>
</main></body></html>`;
}
