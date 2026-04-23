'use client';

import { useState, useTransition } from 'react';
import { signIn } from './actions';

export default function LoginPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const r = await signIn(formData);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <main className="mandala-bg mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
      <div className="text-center">
        <p className="font-script text-6xl text-mint-600 leading-none drop-shadow-[0_2px_0_rgba(249,115,22,0.35)]">
          Mint
        </p>
        <div className="tricolor-divider mx-auto mt-4 w-24" />
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Host sign in</h1>
        <p className="mt-1 text-sm text-slate-600">For staff use only.</p>
      </div>

      <form
        action={handleSubmit}
        className="mt-8 flex flex-col gap-4 rounded-3xl bg-white/85 p-6 shadow-sm ring-1 ring-cream-200 backdrop-blur-sm"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-14 rounded-xl border border-cream-200 bg-white px-4 text-base outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-14 rounded-xl border border-cream-200 bg-white px-4 text-base outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
          />
        </label>
        {error && (
          <div className="rounded-xl bg-saffron-50 px-4 py-3 text-sm text-saffron-900 ring-1 ring-saffron-200">{error}</div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-14 rounded-xl bg-gradient-to-r from-mint-600 to-mint-700 text-base font-semibold text-white shadow-sm ring-1 ring-mint-700/30 active:from-mint-700 active:to-mint-800 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
