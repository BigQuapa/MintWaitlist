'use server';

import { createClient } from '@/lib/supabase/server';

export async function updateAvgWait(minutes: number): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 240) {
    return { ok: false, error: 'Avg wait must be 0–240 minutes.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authorized.' };

  const { error } = await supabase
    .from('settings')
    .update({ avg_wait_minutes: Math.round(minutes), updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
