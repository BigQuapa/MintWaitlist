'use server';

import { createClient } from '@/lib/supabase/server';
import { sendSms, tableReadyBody } from '@/lib/sms';

export async function seatEntry(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authorized.' };

  const { data, error } = await supabase
    .from('waitlist_entries')
    .update({ status: 'seated', seated_at: new Date().toISOString() })
    .eq('id', id)
    .select('name, phone')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  if (data?.phone && data?.name) {
    void sendSms(data.phone, tableReadyBody(data.name));
  }

  return { ok: true };
}

export async function unseatEntry(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authorized.' };

  const { error } = await supabase
    .from('waitlist_entries')
    .update({ status: 'waiting', seated_at: null })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
