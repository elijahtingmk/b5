import { getDb } from '@/db';
import { adminHeaders, requireAdmin } from '@/lib/admin-auth';
import { toCsv } from '@/lib/csv';
import { ExportTable, exportQueries } from '@/lib/exports';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { table } = await params;
  if (!(table in exportQueries)) {
    return new Response('Not found', { status: 404, headers: adminHeaders });
  }
  const db = await getDb();
  const { results } = await db
    .prepare(exportQueries[table as ExportTable])
    .all<Record<string, unknown>>();
  const day = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(results), {
    headers: {
      ...adminHeaders,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${table}-${day}.csv"`
    }
  });
}
