'use client';

import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function QRPage() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 py-10 print:max-w-full print:py-0">
      <div className="no-print mb-6 flex w-full items-center justify-between">
        <Link href="/host" className="text-sm text-mint-700 underline">
          ← Back to dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-mint-600 px-4 py-2 text-sm font-semibold text-white active:bg-mint-700"
        >
          Print
        </button>
      </div>

      <section className="flex w-full flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 ring-1 ring-slate-100 print:ring-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-mint-600">
          Welcome to
        </p>
        <h1 className="mt-1 text-5xl font-bold text-slate-900 print:text-7xl">Mint</h1>
        <p className="mt-3 text-base text-slate-600 print:text-xl">Scan to join the waitlist</p>

        <div className="my-8 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <QRCodeSVG value={url} size={320} marginSize={2} level="M" />
        </div>

        <p className="text-xs text-slate-400 print:text-base">{url}</p>
      </section>

      <p className="no-print mt-4 text-center text-xs text-slate-400">
        Tip: print on letter paper at 100% scale and tape it to the host stand.
      </p>
    </main>
  );
}
