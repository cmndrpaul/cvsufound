-- CvSUFound: Row Level Security (who can read/write what) and photo storage
-- Run this SECOND, after 0001_schema.sql.

-- ---------------------------------------------------------------
-- helper: is the current user an admin?
-- ---------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.locations  enable row level security;
alter table public.items      enable row level security;
alter table public.claims     enable row level security;

-- ---------------- profiles ----------------
-- Users see only their own profile. Admins see everyone (to contact claimants).
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Users may change ONLY their name and student number (never their role).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, student_number) on public.profiles to authenticated;

-- ---------------- categories and locations ----------------
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "locations: public read" on public.locations;
create policy "locations: public read" on public.locations
  for select to anon, authenticated using (true);

drop policy if exists "locations: admin write" on public.locations;
create policy "locations: admin write" on public.locations
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------- items ----------------
-- Anyone can browse items (no personal info is stored on items).
drop policy if exists "items: public read" on public.items;
create policy "items: public read" on public.items
  for select to anon, authenticated using (true);

drop policy if exists "items: insert own" on public.items;
create policy "items: insert own" on public.items
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

drop policy if exists "items: update own or admin" on public.items;
create policy "items: update own or admin" on public.items
  for update to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin())
  with check (reporter_id = (select auth.uid()) or public.is_admin());

drop policy if exists "items: delete own or admin" on public.items;
create policy "items: delete own or admin" on public.items
  for delete to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin());

-- ---------------- claims ----------------
drop policy if exists "claims: read own or admin" on public.claims;
create policy "claims: read own or admin" on public.claims
  for select to authenticated
  using (claimant_id = (select auth.uid()) or public.is_admin());

-- You can claim only open items, and never your own report.
drop policy if exists "claims: insert own" on public.claims;
create policy "claims: insert own" on public.claims
  for insert to authenticated
  with check (
    claimant_id = (select auth.uid())
    and exists (
      select 1 from public.items i
      where i.id = item_id
        and i.status = 'open'
        and i.reporter_id <> (select auth.uid())
    )
  );

drop policy if exists "claims: admin update" on public.claims;
create policy "claims: admin update" on public.claims
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "claims: admin delete" on public.claims;
create policy "claims: admin delete" on public.claims
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------
-- Photo storage bucket (public so photos load on the website)
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-photos', 'item-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Logged-in users can upload only inside a folder named after their own user id.
drop policy if exists "item-photos: upload to own folder" on storage.objects;
create policy "item-photos: upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ...and delete only their own photos.
drop policy if exists "item-photos: delete own" on storage.objects;
create policy "item-photos: delete own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
