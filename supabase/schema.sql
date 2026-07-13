-- ============================================================
-- Scalebiz Marketing — form submissions data model
-- Run this once in the Supabase SQL Editor (see supabase/README.md).
--
-- SECURITY MODEL: the website is static and calls Supabase from the
-- browser with the ANON PUBLIC key. Row Level Security is ON and the
-- ONLY policy granted to the anon role is INSERT. The anon role can
-- therefore add a row but CANNOT read, update, or delete anything.
-- Reading submissions is done from the Supabase dashboard / a
-- service-role context only.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  -- Required for EVERY submission — every lead must be reachable.
  name           text        not null,
  email          text        not null,

  -- Split-CTA form only (null for contact-page submissions)
  company_stage  text,
  growth_blocker text,

  -- Contact form only (null for split-CTA submissions)
  enquiry_type   text,
  message        text,

  -- Classification + attribution
  form_type      text        not null check (form_type in ('split_cta', 'contact')),
  source_page    text,
  entry_source   text,        -- explicit intent, captured at click time (never inferred)
  referrer       text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text
);

-- Guard against empty strings sneaking past the NOT NULL constraint.
alter table public.submissions
  drop constraint if exists submissions_email_not_blank;
alter table public.submissions
  add constraint submissions_email_not_blank check (length(trim(email)) > 0);
alter table public.submissions
  drop constraint if exists submissions_name_not_blank;
alter table public.submissions
  add constraint submissions_name_not_blank check (length(trim(name)) > 0);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

-- ---------- Row Level Security ----------
alter table public.submissions enable row level security;

-- INSERT-only for the browser (anon role). No SELECT/UPDATE/DELETE
-- policy exists, so those are denied for anon by default.
drop policy if exists "anon can insert submissions" on public.submissions;
create policy "anon can insert submissions"
  on public.submissions
  for insert
  to anon
  with check (true);

-- ---------- Verify RLS is actually on (run + eyeball the result) ----------
-- select relname, relrowsecurity from pg_class where relname = 'submissions';
--   relrowsecurity must be TRUE.
-- select polname, polcmd, polroles::regrole[] from pg_policy
--   where polrelid = 'public.submissions'::regclass;
--   expect exactly one policy: INSERT ('a') for {anon}.
