# Mint — Restaurant Waitlist

Self-serve QR-based waitlist for the restaurant **Mint**. Customers scan a paper QR at the host stand, enter name + phone + party size, and see a live page with their position, parties ahead/behind, and estimated wait. Host has a mobile-friendly dashboard to mark people seated and adjust the average wait time.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4 · Supabase (Postgres + Realtime + Auth)

---

## Local setup (one-time)

### 1. Create the Supabase project

1. Go to https://supabase.com → New project. Pick a region close to the restaurant.
2. Save the database password somewhere safe.
3. Once provisioned, open **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Fill in `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run the schema migration

In Supabase: **SQL Editor → New query** → paste the contents of `supabase/migrations/0001_init.sql` → **Run**. Verify the `waitlist_entries` and `settings` tables exist in the Table Editor.

### 4. Create the host user

In Supabase: **Authentication → Users → Add user → Create new user**. Use any email (e.g. `host@mint.local`) and a strong password. Skip email confirmation. Save the credentials — these are what the host enters at `/host/login`.

### 5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 to sign up as a customer, http://localhost:3000/host/login to sign in as the host.

---

## Routes

| Path | Who | What |
|---|---|---|
| `/` | Customers | Signup form (name, phone, party size) |
| `/queue/[token]` | Customers | Live position view with realtime updates |
| `/host/login` | Host | Email + password sign in |
| `/host` | Host | Dashboard: queue, Seat/Remove buttons, avg wait editor |
| `/host/qr` | Host | Printable QR pointing at the deployed customer signup URL |

---

## Testing the full flow

1. Open `/` in two browser windows (or a phone + a laptop).
2. Sign up as Customer A in window 1 → land on `/queue/[tokenA]` showing "You're #1".
3. Sign up as Customer B in window 2 → window 1 updates "Behind you: B" without refresh.
4. Open `/host/login` in a third window, sign in → see both A and B.
5. Tap **Seat** on Customer A → A's screen flips to "Your table is ready!"; B's screen updates to "You're #1".
6. Edit "Avg wait" from 15 → 25 in the host bar → both customer screens recompute estimated wait live.
7. Tap **Remove** on Customer B → confirm → B's screen shows "Your spot was released."
8. Try signing up with B's phone again while still waiting → see "You're already on the list" with a resume link.
9. Open `/host/qr`, click Print → PDF preview shows large QR with "Mint" branding.

---

## Deploy to Vercel

1. Push to a private GitHub repo.
2. Import to Vercel → framework auto-detected.
3. Add the same env vars from `.env.local` in Vercel project settings. Set `NEXT_PUBLIC_SITE_URL` to a placeholder for now.
4. Deploy. Note the production URL.
5. Update `NEXT_PUBLIC_SITE_URL` to the real production URL → redeploy (so the QR points to the right place).
6. Visit `/host/qr` on production, print at 100% scale, tape to the host stand.

---

## Out of scope (v2+)

SMS notifications · multi-restaurant · multi-staff host accounts · party-size-aware wait math · analytics · auto no-show removal · reservations · customer self-cancel · phone OTP verification · i18n · automated tests · custom domain · audit log · PWA install.

See `.claude/plans/binary-bubbling-sunbeam.md` for the full design rationale.
