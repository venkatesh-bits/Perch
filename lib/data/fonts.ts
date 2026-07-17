/**
 * The curated type list.
 *
 * Fonts are self-hosted at build time by next/font (see app/layout.tsx), never
 * fetched from Google at runtime. That buys no FOUT, no third-party request and
 * no CSP hole - but it also means the set has to be fixed at build time. You
 * cannot type a font name into the admin panel and have it appear; you pick one
 * of these.
 *
 * TRADEOFF, and the reason this list is short: every entry here is downloaded,
 * subsetted and served on EVERY page, whether or not it is the chosen one, and
 * each adds its own @font-face block plus a CSS variable to the payload. Ten
 * families is already generous for a site with two type slots. Adding a font is
 * a real cost to every visitor, so add one only by removing one.
 *
 * `key` is what lives in the `site_settings` table. It is an allowlist: a key
 * that is not in here is ignored and the default is used, which is what keeps
 * an arbitrary string in the database from reaching a <style> tag.
 */

export type FontCategory = 'display' | 'body'

export interface FontOption {
  /** Stored in site_settings.font_display / font_body. Never a URL. */
  key: string
  /** Shown in the admin picker. */
  label: string
  /** The CSS variable app/layout.tsx binds this family to. */
  cssVar: string
  /** One line on why you would pick it, for the admin picker. */
  note: string
}

/** Display faces - headings, the wordmark, anything with .font-display. */
export const DISPLAY_FONTS: readonly FontOption[] = [
  {
    key: 'instrument-serif',
    label: 'Instrument Serif',
    cssVar: '--font-instrument-serif',
    note: 'The default. High contrast, a little editorial, italics that earn their keep.',
  },
  {
    key: 'playfair-display',
    label: 'Playfair Display',
    cssVar: '--font-playfair-display',
    note: 'Sharper and more formal. Reads like a masthead.',
  },
  {
    key: 'fraunces',
    label: 'Fraunces',
    cssVar: '--font-fraunces',
    note: 'Soft, wonky, warm. Closest to the paper feel of the palette.',
  },
  {
    key: 'dm-serif-display',
    label: 'DM Serif Display',
    cssVar: '--font-dm-serif-display',
    note: 'Tight and heavy. Big headlines hold their colour.',
  },
  {
    key: 'bricolage-grotesque',
    label: 'Bricolage Grotesque',
    cssVar: '--font-bricolage-grotesque',
    note: 'Sans display with odd angles. Drops the serif register entirely.',
  },
  {
    key: 'space-grotesk',
    label: 'Space Grotesk',
    cssVar: '--font-space-grotesk',
    note: 'Technical, even, slightly cold. Good if you want less romance.',
  },
] as const

/** Body faces - everything else, via --font-sans on <body>. */
export const BODY_FONTS: readonly FontOption[] = [
  {
    key: 'geist',
    label: 'Geist',
    cssVar: '--font-geist',
    note: 'The default. Neutral, tight, holds up at small sizes.',
  },
  {
    key: 'inter',
    label: 'Inter',
    cssVar: '--font-inter',
    note: 'The workhorse. Slightly wider, very legible on screens.',
  },
  {
    key: 'source-sans-3',
    label: 'Source Sans 3',
    cssVar: '--font-source-sans-3',
    note: 'Humanist and friendly. Softer than Geist for long notes.',
  },
  {
    key: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    cssVar: '--font-ibm-plex-sans',
    note: 'A touch of character in the letterforms. Pairs well with serifs.',
  },
] as const

/**
 * Resolve a stored key to its CSS variable, or null if the key is unknown.
 *
 * Null is the important case: it is what an unrecognised, stale or hostile
 * value collapses to, and the caller then falls back to the default. Nothing
 * from the database reaches CSS except by matching an entry above.
 */
export function fontVar(category: FontCategory, key: string | null | undefined): string | null {
  if (!key) return null
  const list = category === 'display' ? DISPLAY_FONTS : BODY_FONTS
  return list.find((f) => f.key === key)?.cssVar ?? null
}

/** The option record for a key, for labelling the admin UI. */
export function fontOption(category: FontCategory, key: string | null | undefined): FontOption | null {
  if (!key) return null
  const list = category === 'display' ? DISPLAY_FONTS : BODY_FONTS
  return list.find((f) => f.key === key) ?? null
}
