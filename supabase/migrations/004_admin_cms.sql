-- ─── 004: ADMIN CMS ──────────────────────────────────────────────────────────
-- Owner-only content layer for Perch: trip media, posts, and an override layer
-- that sits on top of the static destination catalogue.
--
-- Security model:
--   * Only the anon key ever reaches the browser. There is no service_role key
--     anywhere in this app.
--   * Authentication is Supabase Auth (email + password, cookie sessions).
--   * Authorization is this file: the `admins` table plus `public.is_admin()`.
--     EVERY write below is gated by RLS, so the database is the last word - a
--     compromised or hand-rolled client still cannot write.
--
-- This migration is idempotent: safe to run more than once.
-- Paste it into the Supabase SQL editor and run it, then see the BOOTSTRAP
-- block at the very bottom.

-- ─── ADMINS ──────────────────────────────────────────────────────────────────

create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

-- A user may read their own admin row and nothing else. There is deliberately
-- no insert/update/delete policy: admins are granted only via the SQL editor
-- (the bootstrap block below), never through the app.
drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select using (user_id = auth.uid());

-- ─── is_admin() ──────────────────────────────────────────────────────────────
-- security definer so the check still works regardless of the caller's RLS
-- view of `admins`; `set search_path = public` pins resolution so the function
-- cannot be hijacked by a caller-controlled search_path.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ─── TRIP MEDIA ──────────────────────────────────────────────────────────────
-- Photos and videos for a trip log page. day null = general "from the road"
-- gallery; otherwise the media belongs to that day's card.

create table if not exists public.trip_media (
  id         uuid primary key default gen_random_uuid(),
  trip_slug  text not null default 'kashmir',
  day        int,
  kind       text check (kind in ('photo','video')),
  url        text not null,
  caption    text,
  sort       int default 0,
  created_at timestamptz default now()
);

create index if not exists trip_media_trip_slug_idx on public.trip_media (trip_slug, day, sort);

alter table public.trip_media enable row level security;

drop policy if exists "trip_media_public_read" on public.trip_media;
create policy "trip_media_public_read" on public.trip_media
  for select using (true);

drop policy if exists "trip_media_admin_write" on public.trip_media;
create policy "trip_media_admin_write" on public.trip_media
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── POSTS ───────────────────────────────────────────────────────────────────

create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  body       text,
  cover_url  text,
  published  boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.posts enable row level security;

-- Public reads see published posts only. The `or public.is_admin()` arm is what
-- lets the owner list and edit their own drafts in /admin/posts - without it a
-- draft would be invisible to its own author.
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
  for select using (published = true or public.is_admin());

drop policy if exists "posts_admin_write" on public.posts;
create policy "posts_admin_write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── DESTINATION OVERRIDES ───────────────────────────────────────────────────
-- The 97 destinations stay in lib/data/destinations.ts (build-time source of
-- truth - that is why the site is fast and costs nothing). This table only
-- holds per-field overrides that the app merges over those static defaults.
-- A missing row, a null column, or an unreachable DB all mean "use the default".

create table if not exists public.destination_overrides (
  slug             text primary key,
  summary          text,
  image_url        text,
  remote_work_note text,
  updated_at       timestamptz default now()
);

alter table public.destination_overrides enable row level security;

drop policy if exists "destination_overrides_public_read" on public.destination_overrides;
create policy "destination_overrides_public_read" on public.destination_overrides
  for select using (true);

drop policy if exists "destination_overrides_admin_write" on public.destination_overrides;
create policy "destination_overrides_admin_write" on public.destination_overrides
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── STORAGE: `media` bucket ─────────────────────────────────────────────────
-- Public bucket: reads are open (the images are on public pages anyway and a
-- public bucket serves them straight from the CDN for free). Writes are
-- admin-only, enforced here rather than in the app.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ─── BOOTSTRAP ───────────────────────────────────────────────────────────────
-- RUN THIS LINE **AFTER** creating your Auth user.
--
--   1. Supabase dashboard -> Authentication -> Users -> "Add user"
--      -> Create new user, email REPLACE_WITH_YOUR_AUTH_EMAIL, set a password,
--         and tick "Auto Confirm User".
--   2. Come back here and run the insert below. It promotes that user to admin.
--      Until it runs, NOBODY is an admin and every write above is refused -
--      which is the correct default.
--   3. Sign in at /admin/login.
--
-- It is safe to re-run.

insert into public.admins (user_id, email)
select id, email from auth.users where email = 'REPLACE_WITH_YOUR_AUTH_EMAIL'
on conflict do nothing;

-- Sanity check - should return one row after the bootstrap:
--   select a.email, a.created_at from public.admins a;
