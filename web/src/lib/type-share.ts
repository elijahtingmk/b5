// Fields the types.drelijah.org contact form may add to POST /api/enquiry.
// They are ignored unless the submission is from that site and share_type is
// the string "1" (the opt-in checkbox). A type code without that opt-in is
// not stored.

const TYPE_CODE = /^[EI][NS][TF][JP]$/;
export const TYPE_DETAIL_MAX = 500;

export type SharedType = {
  typeCode: string | null;
  typeDetail: string | null;
};

export function optedInToShareType(value: string | undefined): boolean {
  return (value ?? '').trim() === '1';
}

// Uppercases and accepts only a real 16-type code. Anything else is dropped.
export function normaliseTypeCode(value: string | undefined): string | null {
  const code = (value ?? '').trim().toUpperCase();
  return TYPE_CODE.test(code) ? code : null;
}

export function sharedTypeFromForm(
  fromTypesSite: boolean,
  fields: {
    shareType?: string;
    typeCode?: string;
    typeDetail?: string;
  }
): SharedType {
  if (!fromTypesSite || !optedInToShareType(fields.shareType)) {
    return { typeCode: null, typeDetail: null };
  }
  const detail = (fields.typeDetail ?? '').trim().slice(0, TYPE_DETAIL_MAX);
  return {
    typeCode: normaliseTypeCode(fields.typeCode),
    typeDetail: detail || null
  };
}

// Lines added to the existing Telegram and email alerts. Empty unless a type
// was actually stored, which only happens after opt-in.
export function typeAlertLines(
  typeCode: string | null | undefined,
  typeDetail: string | null | undefined
): string[] {
  const lines: string[] = [];
  if (typeCode) lines.push(`Type: ${typeCode}`);
  if (typeDetail) lines.push(`Type detail: ${typeDetail}`);
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
