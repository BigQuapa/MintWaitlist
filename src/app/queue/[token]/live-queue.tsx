'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PublicEntry, WaitlistEntry } from '@/lib/supabase/types';
import { computePosition, estimateWait, firstName, minutesAgo } from '@/lib/wait';

type Props = {
  myEntry: WaitlistEntry;
  initialWaiting: PublicEntry[];
  initialAvgWait: number;
  restaurantName: string;
};

export function LiveQueue({ myEntry, initialWaiting, initialAvgWait, restaurantName }: Props) {
  const [entry, setEntry] = useState<WaitlistEntry>(myEntry);
  const [waiting, setWaiting] = useState<PublicEntry[]>(initialWaiting);
  const [avgWait, setAvgWait] = useState<number>(initialAvgWait);
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(
        'mint:lastEntry',
        JSON.stringify({ token: myEntry.token, name: myEntry.name })
      );
    } catch {}
  }, [myEntry.token, myEntry.name]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('waitlist-customer')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waitlist_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as WaitlistEntry;
            if (row.status === 'waiting') {
              setWaiting((prev) =>
                prev.some((e) => e.id === row.id)
                  ? prev
                  : [...prev, { id: row.id, name: row.name, party_size: row.party_size, created_at: row.created_at }]
              );
            }
            if (row.id === entry.id) setEntry(row);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as WaitlistEntry;
            if (row.id === entry.id) setEntry(row);
            setWaiting((prev) => {
              if (row.status === 'waiting') {
                const exists = prev.some((e) => e.id === row.id);
                if (exists) {
                  return prev.map((e) =>
                    e.id === row.id
                      ? { id: row.id, name: row.name, party_size: row.party_size, created_at: row.created_at }
                      : e
                  );
                }
                return [...prev, { id: row.id, name: row.name, party_size: row.party_size, created_at: row.created_at }];
              }
              return prev.filter((e) => e.id !== row.id);
            });
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as { id: string };
            setWaiting((prev) => prev.filter((e) => e.id !== row.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings' },
        (payload) => {
          const next = payload.new as { avg_wait_minutes: number };
          setAvgWait(next.avg_wait_minutes);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entry.id]);

  const sorted = useMemo(
    () =>
      [...waiting].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [waiting]
  );
  const myPosition = computePosition(sorted, entry.id);
  const ahead = sorted.slice(0, Math.max(0, myPosition - 1));
  const behind = sorted.slice(myPosition);
  const eta = estimateWait(myPosition, avgWait);

  if (entry.status === 'seated') {
    return <TerminalState title="Your table is ready!" subtitle={`Welcome to ${restaurantName}, ${firstName(entry.name)}.`} tone="success" />;
  }
  if (entry.status === 'removed') {
    return (
      <TerminalState
        title="Your spot was released"
        subtitle="If this was a mistake, rejoin below."
        tone="muted"
        action={<Link href="/" className="rounded-xl bg-mint-600 px-6 py-3 font-semibold text-white">Rejoin the waitlist</Link>}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-mint-600">
        {restaurantName}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">
        Hi {firstName(entry.name)} —
      </h1>

      <section className="mt-6 rounded-3xl bg-gradient-to-br from-mint-500 to-mint-700 p-8 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90">You&apos;re party</p>
        <p className="mt-1 text-7xl font-bold tabular-nums leading-none">#{myPosition}</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">~{eta}</span>
          <span className="text-base opacity-90">min wait</span>
        </div>
        <p className="mt-1 text-xs opacity-75">
          Estimate updates as the host seats other parties.
        </p>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Party size" value={`${entry.party_size}`} />
        <Stat label="Waiting" value={`${minutesAgo(entry.created_at)} min`} />
      </div>

      <Section title="Ahead of you" empty="No one is ahead of you. You&apos;re next!">
        {ahead.map((e, i) => (
          <Row key={e.id} pos={i + 1} name={firstName(e.name)} party={e.party_size} />
        ))}
      </Section>

      <Section title="Behind you" empty="No one is behind you yet.">
        {behind.map((e, i) => (
          <Row key={e.id} pos={myPosition + i + 1} name={firstName(e.name)} party={e.party_size} />
        ))}
      </Section>

      <p className="mt-8 text-center text-xs text-slate-400">
        Keep this page open. It updates live.
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const isEmpty = Array.isArray(children) && children.length === 0;
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {isEmpty ? (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-500 ring-1 ring-slate-100">{empty}</p>
      ) : (
        <ul className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">{children}</ul>
      )}
    </section>
  );
}

function Row({ pos, name, party }: { pos: number; name: string; party: number }) {
  return (
    <li className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold tabular-nums text-slate-600">
          {pos}
        </span>
        <span className="font-medium text-slate-800">{name}</span>
      </div>
      <span className="text-xs text-slate-500">party of {party}</span>
    </li>
  );
}

function TerminalState({
  title,
  subtitle,
  tone,
  action,
}: {
  title: string;
  subtitle: string;
  tone: 'success' | 'muted';
  action?: React.ReactNode;
}) {
  const bg = tone === 'success' ? 'from-mint-500 to-mint-700' : 'from-slate-500 to-slate-700';
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${bg} text-5xl text-white shadow-lg`}>
        {tone === 'success' ? '✓' : '·'}
      </div>
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-base text-slate-600">{subtitle}</p>
      {action && <div className="mt-8">{action}</div>}
    </main>
  );
}
