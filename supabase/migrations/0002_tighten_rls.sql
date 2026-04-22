-- Mint waitlist — tighten RLS before going public
-- Run in Supabase SQL editor (Project → SQL Editor → New Query → paste → Run)
--
-- Goals:
--   1. Hide `phone` from anon role — only the authenticated host should ever see it
--   2. Prevent the "resume by phone" flow from leaking phone existence to anon
--   3. Keep realtime working, but never ship phone values over the wire

-- 1. Column-level SELECT — revoke full, grant every column except `phone`
revoke select on public.waitlist_entries from anon;
grant select (id, token, name, party_size, status, created_at, seated_at, removed_at)
  on public.waitlist_entries to anon;

-- 2. SECURITY DEFINER function so anon can resume by phone without reading it
create or replace function public.resume_token_for_phone(p_phone text)
returns text
language sql
security definer
set search_path = public
as $$
  select token
  from public.waitlist_entries
  where phone = p_phone and status = 'waiting'
  limit 1;
$$;

revoke all on function public.resume_token_for_phone(text) from public;
grant execute on function public.resume_token_for_phone(text) to anon, authenticated;

-- 3. Narrow the realtime publication so phone never leaves the database
alter publication supabase_realtime drop table public.waitlist_entries;
alter publication supabase_realtime add table public.waitlist_entries
  (id, token, name, party_size, status, created_at, seated_at, removed_at);
