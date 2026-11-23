// Fields the types.drelijah.org contact form may add to POST /api/enquiry.
// They are ignored unless the submission is from that site and share_type is
// the string "1" (the opt-in checkbox). A type code, detail, or result
// number without that opt-in is not stored.

const TYPE_CODE = /^[EI][NS][TF][JP]$/;
const RESULT_ID = /^[0-9a-f]{24}$/;
export const TYPE_DETAIL_MAX = 500;

// All sixteen codes, in axis order: E/I, then S/N, then T/F, then J/P.
// The admin counts use this order so a missing type still shows as zero.
export const TYPE_CODES = [
  'ENTJ',
  'ENTP',
  'ENFJ',
  'ENFP',
  'ESTJ',
  'ESTP',
  'ESFJ',
  'ESFP',
  'INTJ',
  'INTP',
  'INFJ',
  'INFP',
  'ISTJ',
  'ISTP',
  'ISFJ',
  'ISFP'
] as const;

export type SharedType = {
  typeCode: string | null;
  typeDetail: string | null;
  typeResultId: string | null;
};

export function optedInToShareType(value: string | undefined): boolean {
  return (value ?? '').trim() === '1';
}

// Uppercases and accepts only a real 16-type code. Anything else is dropped.
export function normaliseTypeCode(value: string | undefined): string | null {
  const code = (value ?? '').trim().toUpperCase();
  return TYPE_CODE.test(code) ? code : null;
}

// 24 hex characters, the same shape as newId(). Anything else is dropped.
export function normaliseResultId(value: string | undefined): string | null {
  const id = (value ?? '').trim().toLowerCase();
  return RESULT_ID.test(id) ? id : null;
}

export function sharedTypeFromForm(
  fromTypesSite: boolean,
  fields: {
    shareType?: string;
    typeCode?: string;
    typeDetail?: string;
    typeResultId?: string;
  }
): SharedType {
  if (!fromTypesSite || !optedInToShareType(fields.shareType)) {
    return { typeCode: null, typeDetail: null, typeResultId: null };
  }
  const detail = (fields.typeDetail ?? '').trim().slice(0, TYPE_DETAIL_MAX);
  return {
    typeCode: normaliseTypeCode(fields.typeCode),
    typeDetail: detail || null,
    typeResultId: normaliseResultId(fields.typeResultId)
  };
}

// One count per four-letter code, including zeros, in TYPE_CODES order.
export function countsByType(
  rows: readonly { type_code: string; n: number | bigint }[]
): { code: string; count: number }[] {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.type_code, Number(row.n));
  return TYPE_CODES.map((code) => ({ code, count: totals.get(code) ?? 0 }));
}

// The anonymous save accepts JSON. Extra fields are ignored; only a valid
// type code and an optional short detail are returned.
export function parseTypeResultPayload(
  value: unknown
): { ok: true; typeCode: string; typeDetail: string | null } | { ok: false } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false };
  }
  const body = value as Record<string, unknown>;
  if (typeof body.type_code !== 'string') return { ok: false };
  const typeCode = normaliseTypeCode(body.type_code);
  if (!typeCode) return { ok: false };

  let typeDetail: string | null = null;
  if (body.type_detail !== undefined && body.type_detail !== null) {
    if (typeof body.type_detail !== 'string') return { ok: false };
    const detail = body.type_detail.trim().slice(0, TYPE_DETAIL_MAX);
    typeDetail = detail || null;
  }
  return { ok: true, typeCode, typeDetail };
}

// CORS for POST /api/types-result. allowedOrigin is TYPES_SITE_ORIGIN; any
// other Origin gets no headers and the route refuses the request.
export function typeResultCors(
  origin: string | null,
  allowedOrigin: string
): Record<string, string> | null {
  if (origin !== allowedOrigin) return null;
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    'Cache-Control': 'no-store'
  };
}

// Lines added to the existing Telegram and email alerts. Empty unless a type
// or result number was actually stored, which only happens after opt-in.
export function typeAlertLines(
  typeCode: string | null | undefined,
  typeDetail: string | null | undefined,
  typeResultId?: string | null
): string[] {
  const lines: string[] = [];
  if (typeCode) lines.push(`Type: ${typeCode}`);
  if (typeDetail) lines.push(`Type detail: ${typeDetail}`);
  if (typeResultId) lines.push(`Result number: ${typeResultId}`);
  return lines;
}

// drelijah.org pages stay a bare path. Types pages keep the hostname so the
// admin can list them. A types submission with no path still lands in that
// list, on the contact page.
export function sourcePageFor(
  fromTypesSite: boolean,
  from: string | undefined,
  typesHost: string
): string | undefined {
  const path = from?.startsWith('/') ? from : undefined;
  if (!fromTypesSite) return path;
  return `${typesHost}${path ?? '/contact.html'}`;
}

// The types site's contact page is contact.html. Other origins keep /contact.
export function enquiryReturnLocation(
  origin: string,
  query: string,
  typesOrigin: string
): string {
  const path = origin === typesOrigin ? '/contact.html' : '/contact';
  return `${origin}${path}?${query}#book`;
}
