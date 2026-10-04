import { getCloudflareContext } from '@opennextjs/cloudflare';

type NotifyEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

export async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
  apiBase = 'https://api.telegram.org'
): Promise<void> {
  const response = await fetch(`${apiBase}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Plain text (no parse_mode) so names and messages never need escaping.
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
      disable_web_page_preview: true
    })
  });
  if (!response.ok) {
    throw new Error(
      `Telegram responded ${response.status}: ${await response.text()}`
    );
  }
}

// Sends a Telegram message to the site owner if TELEGRAM_BOT_TOKEN and
// TELEGRAM_CHAT_ID are set as Worker secrets; otherwise does nothing.
// Never throws: the submission is already saved, and a failed alert must not
// turn into an error for the visitor.
export async function notifyOwner(text: string): Promise<void> {
  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } =
      env as NotifyEnv;
    if (!token || !chatId) return;
    const send = sendTelegram(token, chatId, text).catch((error) =>
      console.error('Telegram notification failed', error)
    );
    // Let the response go out without waiting for Telegram.
    if (ctx?.waitUntil) ctx.waitUntil(send);
    else await send;
  } catch (error) {
    console.error('Telegram notification failed', error);
  }
}
