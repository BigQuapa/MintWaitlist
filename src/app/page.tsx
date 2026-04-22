import { createClient } from '@/lib/supabase/server';
import { SignupForm } from './signup-form';

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('settings')
    .select('restaurant_name, avg_wait_minutes')
    .eq('id', 1)
    .maybeSingle();

  const { count } = await supabase
    .from('waitlist_entries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'waiting');

  const restaurantName = settings?.restaurant_name ?? 'Mint';
  const waiting = count ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-mint-600">
          Welcome to
        </p>
        <h1 className="mt-1 text-5xl font-bold tracking-tight text-slate-900">
          {restaurantName}
        </h1>
        <p className="mt-3 text-base text-slate-600">
          {waiting === 0
            ? 'No one is waiting right now. Add yourself below and the host will be with you shortly.'
            : `${waiting} ${waiting === 1 ? 'party is' : 'parties are'} ahead of you. Add yourself below to join the line.`}
        </p>
      </header>

      <SignupForm />

      <p className="mt-10 text-center text-xs text-slate-400">
        After joining you&apos;ll get a live link showing your spot in line.
      </p>
    </main>
  );
}
