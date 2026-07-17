-- ─── 005: SITE SETTINGS ──────────────────────────────────────────────────────
-- One row. It holds the owner's overrides for the site's identity, type, theme
-- colours and front-page copy.
--
-- The governing idea is the same one behind `destination_overrides` in 004:
-- the code is the source of truth and this table is a thin edit layer over it.
-- EVERY column is nullable, and null means "use the hardcoded default in
-- lib/data/site-defaults.ts". So an empty table, a null column, or a Supabase
-- outage all render exactly the site you get today.
--
-- Security model (unchanged from 004):
--   * Only the anon key ever reaches the browser; there is no service_role key.
--   * Reads are public - these values are on every public page anyway, and the
--     public pages read them with the cookie-less anon client so they can stay
--     statically generated.
--   * Writes are gated by public.is_admin() in RLS, so the database is the last
--     word. requireAdmin() in the server actions is defence in depth in front.
--
-- This migration is idempotent: safe to run more than once. Paste it into the
-- Supabase SQL editor and run it. It needs no bootstrap step - 004 already
-- promoted the owner to admin.

create table if not exists public.site_settings (
  -- The `id` trick: a boolean primary key with a check that pins it to true.
  -- Postgres will then refuse a second row, so "the settings" can never be
  -- ambiguous and the app never has to pick between rows.
  id boolean primary key default true check (id),

  -- Identity / meta
  site_title        text,
  tagline           text,
  meta_description  text,

  -- Type. These store the curated KEY from lib/data/fonts.ts (e.g.
  -- 'instrument-serif'), never a URL or a family name. Fonts are self-hosted at
  -- build time by next/font, so a key is all the app can act on - and a key
  -- that is not in the allowlist is ignored rather than trusted.
  font_display      text,
  font_body         text,

  -- Theme. Each is a #rrggbb string, re-validated in the app before it is ever
  -- interpolated into CSS.
  color_brand       text,
  color_brand_deep  text,
  color_brand_mint  text,
  color_brand_gold  text,
  color_paper       text,
  color_ink         text,
  color_ink_soft    text,
  color_line        text,
  color_surface     text,
  color_clay        text,

  -- Copy
  hero_badge        text,
  hero_title        text,
  hero_title_accent text,
  hero_subhead      text,
  featured_heading  text,
  featured_eyebrow  text,
  ev_heading        text,
  ev_body           text,
  cta_heading       text,
  cta_body          text,
  footer_blurb      text,
  about_blurb       text,

  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed the single row with all-nulls, so the admin panel's UPDATE always has a
-- target and never has to branch on insert-vs-update. All-null = "every field
-- is at its default", which is precisely the state of the site before this ran.
insert into public.site_settings (id) values (true)
on conflict (id) do nothing;

-- Sanity check - should return exactly one row, every column null:
--   select * from public.site_settings;
