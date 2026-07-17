import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public-client'
import type { SiteSettings } from '@/lib/types/database'

/** Cache tag. The admin actions call updateTag() with it after a save. */
export const SITE_SETTINGS_TAG = 'site-settings'

/**
 * All-null settings: the shape that means "every field is at its default".
 *
 * This is the value returned on EVERY failure path - no row, RLS refusal, bad
 * credentials, Supabase down, malformed response. The site then renders exactly
 * as it does today. Failure here is invisible to visitors by design.
 */
const DEFAULT_SETTINGS: SiteSettings = {
  id: true,
  site_title: null,
  tagline: null,
  meta_description: null,
  font_display: null,
  font_body: null,
  color_brand: null,
  color_brand_deep: null,
  color_brand_mint: null,
  color_brand_gold: null,
  color_paper: null,
  color_ink: null,
  color_ink_soft: null,
  color_line: null,
  color_surface: null,
  color_clay: null,
  hero_badge: null,
  hero_title: null,
  hero_title_accent: null,
  hero_subhead: null,
  featured_heading: null,
  featured_eyebrow: null,
  ev_heading: null,
  ev_body: null,
  cta_heading: null,
  cta_body: null,
  footer_blurb: null,
  about_blurb: null,
  updated_at: null,
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('site_settings').select('*').maybeSingle()

    if (error) {
      // "Table is not there" is the expected state until the owner runs 005, and
      // the defaults it falls back to are correct - so say so plainly instead of
      // crying error on every prerendered page.
      const notMigrated =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        /schema cache/i.test(error.message)

      if (notMigrated) {
        console.warn(
          '[site-settings] no site_settings table yet - run supabase/migrations/005_site_settings.sql. Using built-in defaults.',
        )
      } else {
        console.error('[site-settings] query error:', error.message)
      }
      return DEFAULT_SETTINGS
    }
    // maybeSingle() gives null when 005 has not been run yet. Same answer.
    return { ...DEFAULT_SETTINGS, ...((data as SiteSettings | null) ?? {}) }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[site-settings] unexpected error:', e)
    return DEFAULT_SETTINGS
  }
}

/**
 * The site settings, read with the cookie-less anon client.
 *
 * WHY unstable_cache, and not just a bare query:
 *
 * This is called from the ROOT layout, so whatever it does to the rendering
 * mode, it does to every page on the site. An uncached fetch is a dynamic data
 * source - per the Next docs, a `fetch` with the default `no-store` "make[s] the
 * route dynamically rendered" - and supabase-js issues exactly that. Calling it
 * raw in the root layout would flip /kashmir, /charging and the rest from
 * prerendered to server-rendered-on-demand, which is the one thing this site
 * cannot afford. (/ is already dynamic for unrelated reasons: getWeatherBatch
 * and getWifiBySlug are uncached fetches too.)
 *
 * unstable_cache puts the query in a cache scope instead, so the fetch inside is
 * not a dynamic signal and prerendering survives. The settings are then read at
 * build/revalidate time and refreshed by updateTag(SITE_SETTINGS_TAG) the
 * moment the owner saves.
 *
 * The 1h revalidate is only a backstop for writes that bypass the panel (a hand
 * edit in the Supabase SQL editor); saves through /admin/settings are immediate.
 *
 * react cache() on top collapses the layout's call and the page's call into one
 * lookup per request.
 */
export const getSiteSettings = cache(
  unstable_cache(fetchSiteSettings, ['site-settings-v1'], {
    tags: [SITE_SETTINGS_TAG],
    revalidate: 3600,
  }),
)

/**
 * The settings, read straight through with no cache. For /admin/settings only.
 *
 * The editor has to show what is actually in the row, not what the public cache
 * last saw, or the owner would be typing over a stale copy. The admin panel is
 * force-dynamic anyway, so there is no prerendering here to protect.
 */
export const getSiteSettingsUncached = cache(fetchSiteSettings)
