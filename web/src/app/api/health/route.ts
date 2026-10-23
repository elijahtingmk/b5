import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/db';

export const dynamic = 'force-dynamic';

// Read-only uptime check. Confirms the D1 binding answers and that the
// notify secrets exist. It must never send mail or Telegram, never call the
// Apps Script relay or the Telegram API, and never write to the database.
const DB_TIMEOUT_MS = 3000;

type NotifyEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ENQUIRY_EMAIL_RELAY_URL?: string;
  ENQUIRY_EMAIL_RELAY_TOKEN?: string;
};

type Checks = {
  db: 'ok' | 'error';
  email_relay: 'configured' | 'missing';
  telegram: 'configured' | 'missing';
};

function present(value: string | undefined): boolean {
  return typeof value === 'string' && value.length > 0;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // A late rejection after the timeout must not surface as unhandled.
  promise.catch(() => {});
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

async function checkDb(): Promise<Checks['db']> {
  try {
    await withTimeout(
      (async () => {
        const db = await getDb();
        await db.prepare('SELECT 1').first();
      })(),
      DB_TIMEOUT_MS
    );
    return 'ok';
  } catch {
    return 'error';
  }
}

async function checkConfig(): Promise<
  Pick<Checks, 'email_relay' | 'telegram'>
> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const {
      ENQUIRY_EMAIL_RELAY_URL: relayUrl,
      ENQUIRY_EMAIL_RELAY_TOKEN: relayToken,
      TELEGRAM_BOT_TOKEN: token,
      TELEGRAM_CHAT_ID: chatId
    } = env as NotifyEnv;
    return {
      email_relay:
        present(relayUrl) && present(relayToken) ? 'configured' : 'missing',
      telegram: present(token) && present(chatId) ? 'configured' : 'missing'
    };
  } catch {
    return { email_relay: 'missing', telegram: 'missing' };
  }
}

async function healthResponse(): Promise<Response> {
  const [db, config] = await Promise.all([checkDb(), checkConfig()]);
  const checks: Checks = { db, ...config };
  const ok =
    checks.db === 'ok' &&
    checks.email_relay === 'configured' &&
    checks.telegram === 'configured';

  return Response.json(
    { ok, checks, time: new Date().toISOString() },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' }
    }
  );
}

export async function GET() {
  return healthResponse();
}

export async function HEAD() {
  const response = await healthResponse();
  return new Response(null, {
    status: response.status,
    headers: response.headers
  });
}
