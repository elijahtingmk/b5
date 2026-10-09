import { getDb } from '@/db';
import { adminHeaders, requireAdmin } from '@/lib/admin-auth';
import { exportTables } from '@/lib/exports';

export const dynamic = 'force-dynamic';

// A small standalone page (no site layout or scripts) with record counts and
// download links. Protected by the ADMIN_PASSWORD secret.
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const db = await getDb();
  const counts = await db
    .prepare(
      `SELECT (SELECT count(*) FROM results) AS results,
              (SELECT count(*) FROM riasec_results) AS riasec,
              (SELECT count(*) FROM leads) AS leads,
              (SELECT count(*) FROM feedback) AS feedback,
              (SELECT count(*) FROM enquiries) AS enquiries`
    )
    .first<Record<string, number>>();

  const rows = exportTables
    .map(({ id, label }) => {
      const n = counts?.[id] ?? 0;
      return `
      <li>
        <span>${label}<small>${n} record${n === 1 ? '' : 's'}</small></span>
        <a href="/admin/export/${id}">Download CSV</a>
      </li>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Admin · drelijah.org</title>
<style>
  body{margin:0;background:#fbf8f3;color:#1a1714;font:16px/1.5 "Source Sans 3","Segoe UI",system-ui,sans-serif}
  main{max-width:40rem;margin:0 auto;padding:3rem 1rem}
  h1{font:600 1.8rem Georgia,serif;margin:0 0 .25rem}
  h1 span{color:#c4964a}
  p{color:#5a544c;margin:.25rem 0 2rem}
  ul{list-style:none;padding:0;margin:0;border-top:1px solid #ddd5c7}
  li{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1rem 0;border-bottom:1px solid #ddd5c7}
  small{display:block;color:#746d63}
  a{background:#0c1424;color:#f6f2ea;text-decoration:none;padding:.55rem 1rem;border-radius:999px;white-space:nowrap}
  a:hover{background:#1c2a40}
  footer{margin-top:2rem;font-size:.9rem;color:#746d63}
</style></head>
<body><main>
  <h1>drelijah<span>.org</span> admin</h1>
  <p>Downloads open in Excel. They contain personal data: keep them off shared
  drives and delete them when you are done.</p>
  <ul>${rows}</ul>
  <footer>To sign out, close this browser window.</footer>
</main></body></html>`;

  return new Response(html, {
    headers: {
      ...adminHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
    }
  });
}
