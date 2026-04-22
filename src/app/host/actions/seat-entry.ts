'use server';

import { createClient } from '@/lib/supabase/server';

export async function seatEntry(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authorized.' };

  const { error } = await supabase
    .from('waitlist_entries')
    .update({ status: 'seated', seated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
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
