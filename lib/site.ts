/**
 * Canonical site configuration. Used by metadata, sitemap, robots and OG tags.
 *
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://perch.app). It falls back
 * to localhost in development so absolute URLs still resolve.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const SITE_NAME = 'Perch'

export const SITE_DESCRIPTION =
  'Work from anywhere. Worry about nothing. Community-verified WiFi, work cafes, ghat road conditions, stays and EV charging for remote workers and road trippers across South India.'

/** Absolute URL helper for canonical links and OG tags. */
export function absoluteUrl(path = ''): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
