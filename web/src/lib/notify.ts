import { getCloudflareContext } from '@opennextjs/cloudflare';

type NotifyEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ENQUIRY_EMAIL_RELAY_URL?: string;
  ENQUIRY_EMAIL_RELAY_TOKEN?: string;
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

// Sends an email via Google Apps Script relay if ENQUIRY_EMAIL_RELAY_URL and
// ENQUIRY_EMAIL_RELAY_TOKEN are set as Worker secrets; otherwise does nothing.
// Never throws: the submission is already saved, and a failed alert must not
// turn into an error for the visitor.
export async function sendOwnerEmail(params: {
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<void> {
  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    const {
      ENQUIRY_EMAIL_RELAY_URL: relayUrl,
      ENQUIRY_EMAIL_RELAY_TOKEN: relayToken
    } = env as NotifyEnv;
    if (!relayUrl || !relayToken) return;

    const send = (async () => {
      try {
        const response = await fetch(relayUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: relayToken,
            subject: params.subject,
            body: params.body,
            replyTo: params.replyTo
          }),
          redirect: 'follow'
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '<unreadable>');
          console.error(
            `Email relay responded ${response.status}: ${body.slice(0, 500)}`
          );
        } else {
          const result = (await response.json().catch(() => ({}))) as {
            ok?: boolean;
          };
          if (!result.ok) {
            console.error('Email relay returned success but ok !== true');
          }
        }
      } catch (error) {
        console.error('Email notification failed', error);
      }
    })();

    // Let the response go out without waiting for the email relay.
    if (ctx?.waitUntil) ctx.waitUntil(send);
    else await send;
  } catch (error) {
    console.error('Email notification failed', error);
  }
}

export type EnquiryEmailData = {
  name: string;
  email: string;
  organisation?: string;
  need: string;
  needLabel: string;
  size?: string;
  sizeLabel?: string;
  hrd?: string;
  hrdLabel?: string;
  phone?: string;
  message?: string;
  sourcePage?: string;
  submittedAt: string;
};

// Sends an email via Google Apps Script relay if ENQUIRY_EMAIL_RELAY_URL and
// ENQUIRY_EMAIL_RELAY_TOKEN are set as Worker secrets; otherwise does nothing.
// Never throws: the submission is already saved, and a failed alert must not
// turn into an error for the visitor.
export async function sendEnquiryEmail(
  data: EnquiryEmailData
): Promise<void> {
  const strip = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();
  const orgOrName = data.organisation?.trim() || data.name;
  const subjectPrefix =
    data.need === 'prisma' ? 'New PRisMA enquiry' : 'New enquiry';
  const subject = strip(`${subjectPrefix}: ${orgOrName}`).slice(0, 200);

  const bodyLines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone && `Phone: ${data.phone}`,
    data.organisation && `Organisation: ${data.organisation}`,
    `Need: ${data.needLabel}`,
    data.sizeLabel && `Size: ${data.sizeLabel}`,
    data.hrdLabel && `HRD Corp claimable: ${data.hrdLabel}`,
    data.sourcePage && `From page: ${data.sourcePage}`,
    `Submitted: ${data.submittedAt}`,
    '',
    data.message && data.message,
    '',
    'Admin: https://big5.drelijah.org/admin'
  ]
    .filter(Boolean)
    .join('\n');

  await sendOwnerEmail({
    subject,
    body: bodyLines,
    replyTo: data.email
  });
}
