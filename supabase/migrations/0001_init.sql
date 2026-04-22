-- Mint waitlist — initial schema
-- Run in Supabase SQL editor (Project → SQL Editor → New Query → paste → Run)

create type entry_status as enum ('waiting', 'seated', 'removed');

create table public.waitlist_entries (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique,
  name         text not null check (length(name) between 1 and 60),
  phone        text not null check (length(phone) between 7 and 20),
  party_size   smallint not null default 2 check (party_size between 1 and 20),
  status       entry_status not null default 'waiting',
  created_at   timestamptz not null default now(),
  seated_at    timestamptz,
  removed_at   timestamptz
);

-- Only one active waiting entry per phone
create unique index waitlist_entries_phone_active_unique
  on public.waitlist_entries (phone)
  where status = 'waiting';

-- Fast ordering for the live queue
create index waitlist_entries_waiting_created_at
  on public.waitlist_entries (created_at)
  where status = 'waiting';

-- Singleton settings row
create table public.settings (
  id                 smallint primary key default 1,
  avg_wait_minutes   smallint not null default 15,
  restaurant_name    text not null default 'Mint',
  updated_at         timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);
insert into public.settings (id) values (1);

-- Realtime
alter publication supabase_realtime add table public.waitlist_entries;
alter publication supabase_realtime add table public.settings;

-- RLS
alter table public.waitlist_entries enable row level security;
alter table public.settings enable row level security;

create policy waitlist_insert_anon on public.waitlist_entries
  for insert to anon, authenticated
  with check (status = 'waiting');

create policy waitlist_read_all on public.waitlist_entries
  for select to anon, authenticated
  using (true);

create policy waitlist_update_host on public.waitlist_entries
  for update to authenticated
  using (true) with check (true);

create policy settings_read_all on public.settings
  for select to anon, authenticated
  using (true);

create policy settings_update_host on public.settings
  for update to authenticated
  using (true) with check (true);
