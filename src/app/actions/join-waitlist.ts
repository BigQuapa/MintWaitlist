'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { newToken } from '@/lib/token';
import { sendSms, joinConfirmationBody } from '@/lib/sms';

export type JoinResult =
  | { ok: true; token: string }
  | { ok: false; error: string; existingToken?: string };

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits;
}

export async function joinWaitlist(formData: FormData): Promise<JoinResult> {
  const name = String(formData.get('name') ?? '').trim();
  const phoneRaw = String(formData.get('phone') ?? '').trim();
  const partySize = Number(formData.get('party_size') ?? 2);

  if (name.length < 1 || name.length > 60) {
    return { ok: false, error: 'Please enter your name.' };
  }
  const phone = normalizePhone(phoneRaw);
  if (phone.length < 7 || phone.length > 20) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }
  if (!Number.isFinite(partySize) || partySize < 1 || partySize > 20) {
    return { ok: false, error: 'Party size must be between 1 and 20.' };
  }

  const supabase = await createClient();
  const token = newToken();

  const { error } = await supabase.from('waitlist_entries').insert({
    token,
    name,
    phone,
    party_size: partySize,
    status: 'waiting',
  });

  if (error) {
    if (error.code === '23505') {
      const { data: existingToken } = await supabase.rpc('resume_token_for_phone', {
        p_phone: phone,
      });
      return {
        ok: false,
        error: "You're already on the list.",
        existingToken: existingToken ?? undefined,
      };
    }
    return { ok: false, error: 'Something went wrong. Try again.' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  void sendSms(phone, joinConfirmationBody(name, `${siteUrl}/queue/${token}`));

  redirect(`/queue/${token}`);
}
