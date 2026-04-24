import 'server-only';
import twilio from 'twilio';

type SendResult = { sent: boolean; reason?: string };

let cached: ReturnType<typeof twilio> | null = null;

function client() {
  if (cached) return cached;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  cached = twilio(sid, token);
  return cached;
}

export async function sendSms(to: string, body: string): Promise<SendResult> {
  const from = process.env.TWILIO_FROM_NUMBER;
  const c = client();
  if (!c || !from) {
    return { sent: false, reason: 'twilio-not-configured' };
  }
  try {
    await c.messages.create({ to, from, body });
    return { sent: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[sms] send failed:', msg);
    return { sent: false, reason: msg };
  }
}

export function joinConfirmationBody(name: string, queueUrl: string): string {
  const firstName = name.trim().split(/\s+/)[0] || name;
  return `Hi ${firstName}, you're on the Mint waitlist. Track your spot live: ${queueUrl}`;
}

export function tableReadyBody(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] || name;
  return `${firstName}, your table at Mint is ready! Please head to the host stand.`;
}
