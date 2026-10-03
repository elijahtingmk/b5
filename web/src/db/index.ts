import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

// The D1 binding is declared in wrangler.jsonc as "DB".
export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error('D1 binding "DB" is missing. Check wrangler.jsonc.');
  }
  return db;
}

// 12 random bytes as 24 hex characters, the same shape as a MongoDB ObjectId.
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
