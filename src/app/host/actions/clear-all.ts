'use server';

import { createClient } from '@/lib/supabase/server';

export async function clearAllWaiting(): Promise<
  { ok: true; cleared: number } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authorized.' };

  const { data, error } = await supabase
    .from('waitlist_entries')
    .update({ status: 'removed', removed_at: new Date().toISOString() })
    .eq('status', 'waiting')
    .select('id');

  if (error) return { ok: false, error: error.message };
  return { ok: true, cleared: data?.length ?? 0 };
}
