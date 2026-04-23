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
    <main className="mandala-bg mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saffron-600">
          Welcome to
        </p>
        <h1 className="mt-2 font-script text-7xl font-bold leading-none text-mint-600 drop-shadow-[0_2px_0_rgba(249,115,22,0.35)]">
          {restaurantName}
        </h1>
        <div className="tricolor-divider mx-auto mt-5 w-32" />
        <p className="mt-5 text-base text-slate-700">
          {waiting === 0
            ? 'No one is waiting right now. Add yourself below and the host will be with you shortly.'
            : `${waiting} ${waiting === 1 ? 'party is' : 'parties are'} ahead of you. Add yourself below to join the line.`}
        </p>
      </header>

      <SignupForm />

      <p className="mt-10 text-center text-xs text-slate-500">
        After joining you&apos;ll get a live link showing your spot in line.
      </p>
    </main>
  );
}
