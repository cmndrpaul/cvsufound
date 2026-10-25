-- CvSUFound: database schema
-- Run this FIRST in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- This creates tables only. It does NOT add any lost/found items.

-- ---------------------------------------------------------------
-- profiles: one row per signed-up user (created automatically)
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text,
  full_name      text not null default '',
  student_number text,
  role           text not null default 'user' check (role in ('user', 'admin')),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- lookup lists used by the filters and the report form
-- ---------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  sort_order int  not null default 0
);

create table if not exists public.locations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  sort_order int  not null default 0
);

-- ---------------------------------------------------------------
-- items: every lost or found report
-- ---------------------------------------------------------------
create table if not exists public.items (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('lost', 'found')),
  title           text not null check (char_length(title) between 3 and 80),
  description     text not null default '' check (char_length(description) <= 500),
  category_id     uuid references public.categories (id) on delete set null,
  location_id     uuid references public.locations (id) on delete set null,
  location_detail text check (char_length(location_detail) <= 120),
  event_date      date not null,
  photo_path      text,
  status          text not null default 'open' check (status in ('open', 'claimed', 'returned')),
  reporter_id     uuid not null references public.profiles (id) on delete cascade,
  created_at      timestamptz not null default now()
);

create index if not exists items_status_created_idx on public.items (status, created_at desc);
create index if not exists items_type_idx           on public.items (type);
create index if not exists items_category_idx       on public.items (category_id);
create index if not exists items_location_idx       on public.items (location_id);
create index if not exists items_reporter_idx       on public.items (reporter_id);

-- ---------------------------------------------------------------
-- claims: "this is mine" (found items) or "I found this" (lost items)
-- The office/admin reviews every claim. Contact details stay private.
-- ---------------------------------------------------------------
create table if not exists public.claims (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.items (id) on delete cascade,
  claimant_id uuid not null references public.profiles (id) on delete cascade,
  message     text not null check (char_length(message) between 10 and 500),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  unique (item_id, claimant_id)
);

create index if not exists claims_status_idx   on public.claims (status, created_at desc);
create index if not exists claims_claimant_idx on public.claims (claimant_id);

-- ---------------------------------------------------------------
-- Automatically create a profile when someone signs up
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, student_number)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'student_number', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
