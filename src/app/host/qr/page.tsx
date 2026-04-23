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
          className="rounded-lg bg-gradient-to-r from-mint-600 to-mint-700 px-4 py-2 text-sm font-semibold text-white shadow-sm active:from-mint-700 active:to-mint-800"
        >
          Print
        </button>
      </div>

      <section className="mandala-bg flex w-full flex-1 flex-col items-center justify-center rounded-3xl bg-white p-8 ring-1 ring-cream-200 print:ring-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-saffron-600">
          Welcome to
        </p>
        <h1 className="mt-2 font-script text-7xl font-bold leading-none text-mint-600 drop-shadow-[0_2px_0_rgba(249,115,22,0.4)] print:text-8xl">
          Mint
        </h1>
        <div className="tricolor-divider mt-4 w-32" />
        <p className="mt-5 text-base text-slate-700 print:text-2xl">Scan to join the waitlist</p>

        <div className="my-8 rounded-2xl bg-white p-4 ring-2 ring-mint-500 shadow-sm">
          <QRCodeSVG value={url} size={320} marginSize={2} level="M" fgColor="#047857" />
        </div>

        <p className="text-xs text-slate-500 print:text-base">{url}</p>
      </section>

      <p className="no-print mt-4 text-center text-xs text-slate-500">
        Tip: print on letter paper at 100% scale and tape it to the host stand.
      </p>
    </main>
  );
}
