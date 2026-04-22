'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { WaitlistEntry } from '@/lib/supabase/types';
import { minutesAgo } from '@/lib/wait';
import { signOut } from './login/actions';
import { seatEntry, unseatEntry } from './actions/seat-entry';
import { removeEntry } from './actions/remove-entry';
import { updateAvgWait } from './actions/update-settings';

type Props = {
  initialEntries: WaitlistEntry[];
  initialAvgWait: number;
  restaurantName: string;
};

type UndoState = { id: string; name: string } | null;

export function Dashboard({ initialEntries, initialAvgWait, restaurantName }: Props) {
  const [entries, setEntries] = useState<WaitlistEntry[]>(initialEntries);
  const [avgWaitInput, setAvgWaitInput] = useState(String(initialAvgWait));
  const [undo, setUndo] = useState<UndoState>(null);
  const [confirmRemove, setConfirmRemove] = useState<WaitlistEntry | null>(null);
  const [, setTick] = useState(0);
  const avgWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('waitlist-host')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waitlist_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as WaitlistEntry;
            if (row.status === 'waiting') {
              setEntries((prev) => (prev.some((e) => e.id === row.id) ? prev : [...prev, row]));
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as WaitlistEntry;
            setEntries((prev) => {
              const without = prev.filter((e) => e.id !== row.id);
              return row.status === 'waiting' ? [...without, row] : without;
            });
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as { id: string };
            setEntries((prev) => prev.filter((e) => e.id !== row.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings' },
        (payload) => {
          const next = payload.new as { avg_wait_minutes: number };
          setAvgWaitInput(String(next.avg_wait_minutes));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleAvgWaitChange(value: string) {
    setAvgWaitInput(value);
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 240) return;
    if (avgWaitTimer.current) clearTimeout(avgWaitTimer.current);
    avgWaitTimer.current = setTimeout(() => {
      void updateAvgWait(n);
    }, 500);
  }

  function handleSeat(entry: WaitlistEntry) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    void seatEntry(entry.id);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndo({ id: entry.id, name: entry.name });
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  }

  function handleUndo() {
    if (!undo) return;
    void unseatEntry(undo.id);
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }

  function handleRemoveConfirmed(entry: WaitlistEntry) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    void removeEntry(entry.id);
    setConfirmRemove(null);
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-32 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-mint-600">
            {restaurantName} · Host
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Waitlist</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/host/qr"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 active:bg-slate-100"
          >
            QR
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 active:bg-slate-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <label htmlFor="avgwait" className="text-sm font-medium text-slate-700">
          Avg wait
        </label>
        <input
          id="avgwait"
          type="number"
          min={0}
          max={240}
          value={avgWaitInput}
          onChange={(e) => handleAvgWaitChange(e.target.value)}
          className="h-12 w-20 rounded-lg border border-slate-300 bg-white px-3 text-center text-lg font-semibold text-slate-900 outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
        />
        <span className="text-sm text-slate-600">minutes per party</span>
        <span className="ml-auto text-xs text-slate-400">
          {entries.length} {entries.length === 1 ? 'party' : 'parties'} waiting
        </span>
      </div>

      <section className="mt-5 flex flex-col gap-3">
        {sorted.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-100">
            <p className="text-base font-medium">No one is waiting.</p>
            <p className="mt-1 text-sm">Walk-ins will appear here as they scan the QR.</p>
          </div>
        ) : (
          sorted.map((entry, idx) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              position={idx + 1}
              onSeat={() => handleSeat(entry)}
              onRemove={() => setConfirmRemove(entry)}
            />
          ))
        )}
      </section>

      {undo && <UndoToast undo={undo} onUndo={handleUndo} />}
      {confirmRemove && (
        <ConfirmDialog
          title={`Remove ${confirmRemove.name}?`}
          message="They'll be notified their spot was released."
          confirmLabel="Remove"
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => handleRemoveConfirmed(confirmRemove)}
        />
      )}
    </main>
  );
}

function EntryRow({
  entry,
  position,
  onSeat,
  onRemove,
}: {
  entry: WaitlistEntry;
  position: number;
  onSeat: () => void;
  onRemove: () => void;
}) {
  const [busy, startTransition] = useTransition();
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-100 text-base font-bold tabular-nums text-mint-800">
          {position}
        </span>
        <div className="flex-1 min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{entry.name}</p>
          <p className="text-xs text-slate-500">
            party of {entry.party_size} · waiting {minutesAgo(entry.created_at)} min
          </p>
          <a
            href={`tel:${entry.phone}`}
            className="mt-1 inline-block text-sm font-medium text-mint-700 underline"
          >
            {entry.phone}
          </a>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => startTransition(onSeat)}
          disabled={busy}
          className="flex-1 rounded-xl bg-mint-600 py-3 text-sm font-semibold text-white active:bg-mint-700 disabled:opacity-60"
        >
          Seat
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-60"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

function UndoToast({ undo, onUndo }: { undo: { id: string; name: string }; onUndo: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl">
      <span className="text-sm">Seated {undo.name}</span>
      <button
        type="button"
        onClick={onUndo}
        className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white active:bg-white/20"
      >
        Undo
      </button>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 active:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white active:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
