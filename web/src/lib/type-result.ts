// Body-size guard for POST /api/types-result. No other modules: the node
// tests import this file directly.

export const TYPE_RESULT_BODY_MAX = 8192;

export function isJsonContentType(value: string | null): boolean {
  return (value ?? '').toLowerCase().startsWith('application/json');
}

// Reads at most maxBytes. A larger Content-Length is refused without reading
// the rest of the body.
export async function readLimitedBody(
  request: Request,
  maxBytes: number
): Promise<{ ok: true; text: string } | { ok: false; status: 400 | 413 }> {
  const declared = request.headers.get('Content-Length');
  if (declared !== null) {
    if (!/^\d+$/.test(declared.trim())) return { ok: false, status: 400 };
    if (Number(declared) > maxBytes) return { ok: false, status: 413 };
  }
  if (!request.body) return { ok: true, text: '' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }

  let size = 0;
  for (const chunk of chunks) size += chunk.byteLength;
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(bytes) };
}
