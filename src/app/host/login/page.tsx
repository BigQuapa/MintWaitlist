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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
      <p className="text-sm font-semibold uppercase tracking-widest text-mint-600">
        Mint
      </p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Host sign in</h1>
      <p className="mt-2 text-sm text-slate-600">
        For staff use only.
      </p>

      <form action={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-14 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-14 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-mint-500 focus:ring-2 focus:ring-mint-200"
          />
        </label>
        {error && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-14 rounded-xl bg-mint-600 text-base font-semibold text-white active:bg-mint-700 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
