import { fontVar } from '@/lib/data/fonts'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'
import type { SiteSettings } from '@/lib/types/database'

/**
 * What the site says and looks like when nobody has touched /admin/settings.
 *
 * These are not "sensible defaults" - they are a transcription of the exact
 * strings and colours the site shipped with. That is the whole contract of the
 * settings layer: an empty `site_settings` table, a null column, or a Supabase
 * outage must all render precisely this file. If you change a value here you
 * are changing the site, not the fallback.
 *
 * Kept free of heavy imports (no destination catalogue) on purpose: the admin
 * settings form is a Client Component and pulls these in for its placeholders.
 */

// ─── Identity ────────────────────────────────────────────────────────────────

export const SITE_DEFAULTS = {
  siteTitle: SITE_NAME,
  tagline: 'Work from anywhere. Worry about nothing.',
  metaDescription: SITE_DESCRIPTION,

  // Type: keys from lib/data/fonts.ts, not family names.
  fontDisplay: 'instrument-serif',
  fontBody: 'geist',

  // ─── Copy ──────────────────────────────────────────────────────────────────
  heroTitle: 'Work from anywhere.',
  heroTitleAccent: 'Worry about nothing.',
  heroSubhead:
    'Tested WiFi, real road status, stays, treks, seasons and the animals you share the road with — Western Ghats to the Himalaya, checked by people who actually went.',

  featuredEyebrow: 'Where to perch',
  featuredHeading: "Pick a hill. We've done the homework.",

  evHeading: 'Charge past the last town.',
  evBody: 'Every operator map that stays current — from the plains to the passes.',

  ctaHeading: "We don't take a cut. So this only works if you write it down.",
  ctaBody:
    'Ran a speed test? Hit a closed pass? Found a stay that actually has a desk? Thirty seconds of typing saves the next rider a day.',

  footerBlurb:
    'Work from anywhere. Worry about nothing. The practical stuff remote workers and road trippers need before heading into the Indian hills, Western Ghats to the Himalaya.',
  aboutBlurb:
    'Built by travellers, for travellers. We do not take a cut from any stay or transport booking, so the notes here owe nothing to anyone but the people who wrote them.',
} as const

/**
 * The hero badge counts the live catalogue, so its default cannot be a literal.
 * Both the home page and the admin placeholder build it from this, so the
 * placeholder always shows the string the visitor would actually see.
 */
export function heroBadgeDefault(destinationCount: number): string {
  return `${destinationCount} hill stations, checked by people who actually went`
}

// ─── Theme ───────────────────────────────────────────────────────────────────

/**
 * The ten themeable tokens: which `site_settings` column drives which CSS
 * variable, and the value in app/globals.css it falls back to.
 *
 * One table, two consumers - app/layout.tsx emits the overrides from it and the
 * admin panel builds its colour inputs from it. They cannot drift apart.
 *
 * Only these ten are exposed. The rest of the palette (--space, --paper-deep,
 * --surface-2, --hairline, --brand-violet) and every shadow/motion token stay
 * in CSS, because they are derived or structural and letting them be set
 * independently is how a coherent palette turns into a mess.
 */
export interface ThemeColorDef {
  /** Column in public.site_settings. */
  column: ThemeColorColumn
  /** CSS variable in app/globals.css that it overrides. */
  cssVar: string
  label: string
  /** The value in globals.css. Shown beside the input and used when unset. */
  fallback: string
  note: string
}

export type ThemeColorColumn =
  | 'color_brand'
  | 'color_brand_deep'
  | 'color_brand_mint'
  | 'color_brand_gold'
  | 'color_paper'
  | 'color_ink'
  | 'color_ink_soft'
  | 'color_line'
  | 'color_surface'
  | 'color_clay'

export const THEME_COLORS: readonly ThemeColorDef[] = [
  {
    column: 'color_brand',
    cssVar: '--brand',
    label: 'Brand',
    fallback: '#1C5240',
    note: 'Deep pine. Buttons, links, the wordmark.',
  },
  {
    column: 'color_brand_deep',
    cssVar: '--brand-deep',
    label: 'Brand deep',
    fallback: '#143C2F',
    note: 'The darker pine behind the hero and button hovers.',
  },
  {
    column: 'color_brand_mint',
    cssVar: '--brand-mint',
    label: 'Brand mint',
    fallback: '#7FB89C',
    note: 'Soft accent. Hover borders, hero gradient, focus rings on dark.',
  },
  {
    column: 'color_brand_gold',
    cssVar: '--brand-gold',
    label: 'Brand gold',
    fallback: '#E0A93B',
    note: 'The warm pop. EV panel, hero gradient, marquee stars.',
  },
  {
    column: 'color_paper',
    cssVar: '--paper',
    label: 'Paper',
    fallback: '#F7F4EF',
    note: 'Page background, and the text colour on brand fills.',
  },
  {
    column: 'color_ink',
    cssVar: '--ink',
    label: 'Ink',
    fallback: '#1A1714',
    note: 'Body text.',
  },
  {
    column: 'color_ink_soft',
    cssVar: '--ink-soft',
    label: 'Ink soft',
    fallback: '#6B6259',
    note: 'Muted text. Keep it readable on paper.',
  },
  {
    column: 'color_line',
    cssVar: '--line',
    label: 'Line',
    fallback: '#E4DDD2',
    note: 'Borders and card edges.',
  },
  {
    column: 'color_surface',
    cssVar: '--surface',
    label: 'Surface',
    fallback: '#FFFFFF',
    note: 'Card fill, sitting on paper.',
  },
  {
    column: 'color_clay',
    cssVar: '--clay',
    label: 'Clay',
    fallback: '#C2603E',
    note: 'Warnings and destructive actions.',
  },
] as const

/**
 * A colour is only allowed through if it is exactly #rrggbb.
 *
 * This is the gate that stops a database value becoming CSS injection: the
 * output of layout.tsx's <style> is built from these strings, so "anything that
 * is not six hex digits" has to mean "use the default", not "escape it and hope".
 * Deliberately strict - no #rgb, no rgb(), no named colours, no whitespace.
 */
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export function isHexColor(value: string | null | undefined): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value)
}

/** A validated #rrggbb (normalised to uppercase), or null. */
export function safeHexColor(value: string | null | undefined): string | null {
  if (!isHexColor(value)) return null
  return value.toUpperCase()
}

// ─── The :root override block ────────────────────────────────────────────────

/**
 * Build the CSS that app/layout.tsx drops into a <style> tag, or null when
 * there is nothing to override (the common case, and the cheapest one - no tag
 * is rendered at all).
 *
 * Two things worth knowing about the output:
 *
 * 1. NOTHING from the database is interpolated verbatim. Colours must clear
 *    safeHexColor() (exactly #rrggbb), and fonts are looked up in the curated
 *    allowlist and emitted as `var(--font-<key>)` - a variable name this file
 *    controls, never a string the owner typed. A hostile value cannot close the
 *    declaration and start a new rule, because it never reaches the string.
 *
 * 2. The selector is `html:root`, not `:root`. Both globals.css and this block
 *    set the same custom properties, so the winner would otherwise come down to
 *    which one React happens to put first in <head> - and that is not a contract
 *    worth betting the theme on. `html:root` is one element selector heavier, so
 *    it wins on specificity regardless of order.
 */
export function buildRootCss(settings: SiteSettings): string | null {
  const decls: string[] = []

  for (const c of THEME_COLORS) {
    const hex = safeHexColor(settings[c.column])
    if (hex) decls.push(`${c.cssVar}:${hex}`)
  }

  const display = fontVar('display', settings.font_display)
  if (display) decls.push(`--font-display:var(${display})`)

  const body = fontVar('body', settings.font_body)
  if (body) decls.push(`--font-sans:var(${body})`)

  if (decls.length === 0) return null
  return `html:root{${decls.join(';')}}`
}
