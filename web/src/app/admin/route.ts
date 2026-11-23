import { needs } from '@/config/enquiry';
import { getDb } from '@/db';
import {
  TYPES_PAGE_LIMIT,
  leadMatches,
  renderAdminPage,
  serialMatches,
  type TypeResultRow,
  type TypesLeadRow
} from '@/lib/admin-page';
import { adminHeaders, requireAdmin } from '@/lib/admin-auth';
import {
  adminCountsSql,
  exportTables,
  typeResultCountsSql,
  typeResultsListSql,
  typesLeadsListSql
} from '@/lib/exports';
import { countsByType } from '@/lib/type-share';

export const dynamic = 'force-dynamic';

// A small standalone page (no site layout or scripts) with record counts,
// CSV downloads, and a lookup of types.drelijah.org contact leads.
// Protected by the ADMIN_PASSWORD secret.
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const query = (new URL(request.url).searchParams.get('q') ?? '')
    .trim()
    .slice(0, 100);

  const db = await getDb();
  const counts =
    (await db.prepare(adminCountsSql).first<Record<string, number>>()) ?? {};
  const listed = await db
    .prepare(`${typesLeadsListSql} LIMIT ?`)
    .bind(TYPES_PAGE_LIMIT + 1)
    .all<TypesLeadRow>();
  const listCapped = listed.results.length > TYPES_PAGE_LIMIT;
  const pool = listCapped
    ? listed.results.slice(0, TYPES_PAGE_LIMIT)
    : listed.results;
  const typesLeads = pool.filter((lead) => leadMatches(lead, query, needs));

  const resultListed = await db
    .prepare(`${typeResultsListSql} LIMIT ?`)
    .bind(TYPES_PAGE_LIMIT + 1)
    .all<TypeResultRow>();
  const resultsCapped = resultListed.results.length > TYPES_PAGE_LIMIT;
  const resultPool = resultsCapped
    ? resultListed.results.slice(0, TYPES_PAGE_LIMIT)
    : resultListed.results;
  const typeResults = resultPool.filter((row) => serialMatches(row, query));
  const counted = await db
    .prepare(typeResultCountsSql)
    .all<{ type_code: string; n: number }>();
  const typeCounts = countsByType(counted.results);

  const html = renderAdminPage({
    downloads: exportTables,
    counts,
    topicLabels: needs,
    typesLeads,
    typesTotal: Number(counts.types ?? 0),
    typeResults,
    typeResultTotal: typeCounts.reduce((sum, row) => sum + row.count, 0),
    typeCounts,
    query,
    listCapped,
    resultsCapped
  });

  return new Response(html, {
    headers: {
      ...adminHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self'"
    }
  });
}
