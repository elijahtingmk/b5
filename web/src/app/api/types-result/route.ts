import { TYPES_SITE_ORIGIN } from '@/config/enquiry';
import { getDb, newId } from '@/db';
import {
  TYPE_RESULT_BODY_MAX,
  isJsonContentType,
  readLimitedBody
} from '@/lib/type-result';
import { parseTypeResultPayload, typeResultCors } from '@/lib/type-share';

export const dynamic = 'force-dynamic';

// Completed 16-type tests from types.drelijah.org. Saves a result number and
// the type only. Does not send Telegram or email, and does not store a name,
// email, or any other identity field sent in the body.

function json(body: unknown, status: number, headers: HeadersInit) {
  return Response.json(body, { status, headers });
}

export async function OPTIONS(request: Request) {
  const headers = typeResultCors(
    request.headers.get('Origin'),
    TYPES_SITE_ORIGIN
  );
  if (!headers) {
    return new Response(null, {
      status: 403,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
  return new Response(null, { status: 204, headers });
}

export async function POST(request: Request) {
  const cors = typeResultCors(request.headers.get('Origin'), TYPES_SITE_ORIGIN);
  if (!cors) {
    return new Response('Forbidden', {
      status: 403,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
  if (!isJsonContentType(request.headers.get('Content-Type'))) {
    return json({ error: 'invalid' }, 415, cors);
  }

  const limited = await readLimitedBody(request, TYPE_RESULT_BODY_MAX);
  if (!limited.ok) return json({ error: 'invalid' }, limited.status, cors);

  let payload: unknown;
  try {
    payload = JSON.parse(limited.text);
  } catch {
    return json({ error: 'invalid' }, 400, cors);
  }
  const parsed = parseTypeResultPayload(payload);
  if (!parsed.ok) return json({ error: 'invalid' }, 400, cors);

  const id = newId();
  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO type_results (id, type_code, type_detail)
         VALUES (?, ?, ?)`
      )
      .bind(id, parsed.typeCode, parsed.typeDetail)
      .run();
  } catch (error) {
    console.error(error);
    return json({ error: 'server' }, 500, cors);
  }

  return json({ id }, 200, cors);
}
