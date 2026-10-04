-- Portfolio admin data, in its own schema so it never touches other tables in
-- the shared Neon database. Safe to re-run.

create schema if not exists portfolio;

-- "Let's talk" submissions
create table if not exists portfolio.messages (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) <= 200),
  email       text not null check (char_length(email) <= 320),
  message     text not null check (char_length(message) <= 5000),
  country     text,
  city        text,
  device      text,
  read_at     timestamptz
);
create index if not exists messages_created_idx on portfolio.messages (created_at desc);

-- Cookieless visit analytics. `visitor` is a salted hash of IP + user agent that
-- rotates daily, so no IP is stored and nobody is followed across days.
--   view    a page load (value: viewport width)
--   section a section scrolled into view (name: section id)
--   click   an outbound link or the résumé (name: target)
--   leave   the tab was closed or hidden (value: seconds on the page)
create table if not exists portfolio.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('view', 'section', 'click', 'leave')),
  path        text not null default '/',
  name        text,
  value       integer,
  referrer    text,
  country     text,
  city        text,
  device      text,
  browser     text,
  os          text,
  visitor     text not null,
  session     text
);
create index if not exists events_time_idx on portfolio.events (created_at desc);
create index if not exists events_kind_time_idx on portfolio.events (kind, created_at desc);
