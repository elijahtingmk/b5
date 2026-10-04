import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/db';
import { notifyOwner } from '@/lib/notify';
import {
  MAIN_SITE_NOTICE_VERSION,
  allowedOrigins,
  hrdCorp,
  needs,
  sizes
} from '@/config/enquiry';

export const dynamic = 'force-dynamic';

const keys = <T extends object>(o: T) =>
  Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || undefined)
    .optional();

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  organisation: optional(150),
  need: z.enum(keys(needs)),
  size: z.enum(keys(sizes)).optional(),
  hrd: z.enum(keys(hrdCorp)).optional(),
  phone: optional(40),
  message: optional(2000),
  from: optional(200)
});

// Submissions faster than this after the page loaded are treated as bots.
const MIN_FILL_MS = 3000;

function back(origin: string, query: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${origin}/contact?${query}#book`,
      'Cache-Control': 'no-store'
    }
  });
}

async function turnstileOk(
  secret: string,
  token: string,
  ip: string | null
): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body }
  );
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

// The drelijah.org contact form is a plain HTML form that posts here; we
// answer with a redirect back to the contact page, so it works without
// cross-origin JavaScript.
export async function POST(request: Request) {
  const origin = request.headers.get('Origin') ?? '';
  if (!allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back(origin, 'error=invalid');
  }
  const field = (name: string) => {
    const value = form.get(name);
    return typeof value === 'string' ? value : undefined;
  };

  // Bot traps: a hidden field people never fill, and a minimum fill time.
  const started = Number(field('started'));
  if (field('website') || (started && Date.now() - started < MIN_FILL_MS)) {
    return back(origin, 'sent=1');
  }

  const { env } = await getCloudflareContext({ async: true });
  const secret = (env as { TURNSTILE_SECRET?: string }).TURNSTILE_SECRET;
  if (secret) {
    const token = field('cf-turnstile-response') ?? '';
    const ip = request.headers.get('CF-Connecting-IP');
    if (!token || !(await turnstileOk(secret, token, ip).catch(() => false))) {
      return back(origin, 'error=verify');
    }
  }

  const parsed = enquirySchema.safeParse({
    name: field('name'),
    email: field('email'),
    organisation: field('organisation'),
    need: field('need'),
    size: field('size') || undefined,
    hrd: field('hrd') || undefined,
    phone: field('phone'),
    message: field('message'),
    from: field('from')
  });
  if (!parsed.success) return back(origin, 'error=invalid');
  const e = parsed.data;
  const sourcePage = e.from?.startsWith('/') ? e.from : undefined;

  try {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO enquiries (name, email, organisation, need, size, hrd_corp,
           phone, message, source_page, notice_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        e.name,
        e.email,
        e.organisation ?? null,
        e.need,
        e.size ?? null,
        e.hrd ?? null,
        e.phone ?? null,
        e.message ?? null,
        sourcePage ?? null,
        MAIN_SITE_NOTICE_VERSION
      )
      .run();
  } catch (error) {
    console.error(error);
    return back(origin, 'error=server');
  }

  await notifyOwner(
    [
      'New scoping-call request on drelijah.org',
      `Name: ${e.name}`,
      `Email: ${e.email}`,
      e.phone && `Phone: ${e.phone}`,
      e.organisation && `Organisation: ${e.organisation}`,
      `Need: ${needs[e.need]}`,
      e.size && `Size: ${sizes[e.size]}`,
      e.hrd && `HRD Corp claimable: ${hrdCorp[e.hrd]}`,
      sourcePage && `From page: ${sourcePage}`,
      e.message && `\n${e.message}`
    ]
      .filter(Boolean)
      .join('\n')
  );

  return back(origin, 'sent=1');
}
