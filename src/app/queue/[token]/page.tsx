import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PublicEntry, WaitlistEntry } from '@/lib/supabase/types';
import { LiveQueue } from './live-queue';

export default async function QueuePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from('waitlist_entries')
    .select('id, token, name, party_size, status, created_at, seated_at, removed_at')
    .eq('token', token)
    .maybeSingle<WaitlistEntry>();

  if (!entry) notFound();

  const { data: waiting } = await supabase
    .from('waitlist_entries')
    .select('id, name, party_size, created_at')
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .returns<PublicEntry[]>();

  const { data: settings } = await supabase
    .from('settings')
    .select('avg_wait_minutes, restaurant_name')
    .eq('id', 1)
    .maybeSingle();

  return (
    <LiveQueue
      myEntry={entry}
      initialWaiting={waiting ?? []}
      initialAvgWait={settings?.avg_wait_minutes ?? 15}
      restaurantName={settings?.restaurant_name ?? 'Mint'}
    />
  );
}
