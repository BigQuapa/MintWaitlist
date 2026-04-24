'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { joinWaitlist, type JoinResult } from './actions/join-waitlist';

export function SignupForm() {
  const [partySize, setPartySize] = useState(2);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<JoinResult | null>(null);

  function handleSubmit(formData: FormData) {
    formData.set('party_size', String(partySize));
    startTransition(async () => {
      const r = await joinWaitlist(formData);
      setResult(r);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-5 rounded-3xl bg-white/85 p-6 shadow-sm ring-1 ring-cream-200 backdrop-blur-sm"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Your name</span>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={60}
          placeholder="Jane Doe"
          className="h-14 rounded-xl border border-cream-200 bg-white px-4 text-lg outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Phone number</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="(555) 123-4567"
          className="h-14 rounded-xl border border-cream-200 bg-white px-4 text-lg outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
        />
        <span className="text-xs text-slate-500">
          We&apos;ll text you a confirmation link and let you know when your table is ready. Not shared with other guests.
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Party size</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPartySize((s) => Math.max(1, s - 1))}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-cream-200 bg-white text-2xl font-semibold text-slate-700 active:bg-cream-100"
            aria-label="Decrease party size"
          >
            −
          </button>
          <div className="flex h-14 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-mint-50 via-cream-50 to-saffron-50 text-2xl font-bold text-mint-800 ring-1 ring-cream-200">
            {partySize}
          </div>
          <button
            type="button"
            onClick={() => setPartySize((s) => Math.min(20, s + 1))}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-cream-200 bg-white text-2xl font-semibold text-slate-700 active:bg-cream-100"
            aria-label="Increase party size"
          >
            +
          </button>
        </div>
      </div>

      {result && !result.ok && (
        <div className="rounded-xl bg-saffron-50 p-4 text-saffron-900 ring-1 ring-saffron-200">
          <p className="font-medium">{result.error}</p>
          {result.existingToken && (
            <Link
              href={`/queue/${result.existingToken}`}
              className="mt-2 inline-block font-semibold text-mint-700 underline"
            >
              View your spot →
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-14 rounded-xl bg-gradient-to-r from-mint-600 to-mint-700 text-lg font-semibold text-white shadow-sm ring-1 ring-mint-700/30 transition active:from-mint-700 active:to-mint-800 disabled:opacity-60"
      >
        {pending ? 'Joining…' : 'Join the waitlist'}
      </button>
    </form>
  );
}
