import { createClient } from '@/lib/supabase/server';
import type { WaitlistEntry } from '@/lib/supabase/types';
import { Dashboard } from './dashboard';

export default async function HostPage() {
  const supabase = await createClient();

  const { data: waiting } = await supabase
    .from('waitlist_entries')
    .select('id, token, name, phone, party_size, status, created_at, seated_at, removed_at')
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .returns<WaitlistEntry[]>();

  const { data: settings } = await supabase
    .from('settings')
    .select('avg_wait_minutes, restaurant_name')
    .eq('id', 1)
    .maybeSingle();

  return (
    <Dashboard
      initialEntries={waiting ?? []}
      initialAvgWait={settings?.avg_wait_minutes ?? 15}
      restaurantName={settings?.restaurant_name ?? 'Mint'}
    />
  );
}
