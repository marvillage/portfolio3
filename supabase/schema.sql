-- Run this in the Supabase SQL editor to create the contact-form table.
-- Dashboard → SQL Editor → paste → Run.

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Row Level Security: keep the table locked down. The API route uses the
-- SERVICE ROLE key (server-side only), which bypasses RLS, so no public
-- insert policy is needed. Do NOT expose the service role key to the browser.
alter table public.messages enable row level security;

-- View submissions: Dashboard → Table editor → messages.
