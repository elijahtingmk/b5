import { getCloudflareContext } from '@opennextjs/cloudflare';

// Shared headers for every admin response: never cached, never indexed,
// never framed.
export const adminHeaders = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer'
};

const MIN_PASSWORD_LENGTH = 16;

async function sha256(text: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(text);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data));
}

// Compares hashes so the comparison takes the same time whatever the input.
async function sameSecret(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function passwordFrom(request: Request): string | null {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Basic ')) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6)), (c) =>
      c.charCodeAt(0)
    );
    const decoded = new TextDecoder().decode(bytes);
    const colon = decoded.indexOf(':');
    // The username is ignored; only the password is checked.
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

// Returns a Response to send instead (404 when the admin area is switched
// off, 401 to ask for the password), or null when the request is allowed.
export async function requireAdmin(request: Request): Promise<Response | null> {
  const { env } = await getCloudflareContext({ async: true });
  const expected = (env as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
  if (!expected || expected.length < MIN_PASSWORD_LENGTH) {
    return new Response('Not found', { status: 404, headers: adminHeaders });
  }
  const given = passwordFrom(request);
  if (given !== null && (await sameSecret(given, expected))) return null;
  return new Response('Password required', {
    status: 401,
    headers: {
      ...adminHeaders,
      'WWW-Authenticate': 'Basic realm="drelijah.org admin", charset="UTF-8"'
    }
  });
}
