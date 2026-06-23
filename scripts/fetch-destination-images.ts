/**
 * Build-time destination image fetcher.
 *
 * Pulls a lead photo for each destination from Wikipedia / Wikimedia Commons via
 * the keyless MediaWiki API (no key, $0), captures CC attribution + license, and
 * writes lib/data/destination-images.ts. Same build-time-data pattern as the EV
 * and stays scripts. Images are CC-licensed; we store + display attribution.
 *
 * Run:  npx tsx scripts/fetch-destination-images.ts
 * Then commit the regenerated lib/data/destination-images.ts.
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DESTINATIONS } from '../lib/data/destinations'

const UA = 'PerchTripPlanner/1.0 (https://github.com/perch; hobby project) contact: hello@perch.app'
const THUMB = 800

// Explicit title overrides for destinations whose plain name resolves to an
// admin/district page (map image) instead of a scenic one.
const OVERRIDE: Record<string, string> = {
  coorg: 'Madikeri',
  wayanad: 'Wayanad district',
  nilgiris: 'Nilgiri Mountains',
  gudalur: 'Gudalur, Nilgiris',
  farahabad: 'Amrabad Tiger Reserve',
  puducherry: 'Promenade Beach',
  'silent-valley': 'Silent Valley National Park',
}

interface ImageResult {
  url: string
  width: number
  height: number
  attribution: string
  license: string
  sourceUrl: string
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/\s+/g, ' ').trim()
}

// Reject maps, flags, locators, seals and SVG icons - we want a real photo.
function isBadImage(filename: string): boolean {
  return /map|locator|flag|coat[_ ]?of[_ ]?arms|seal|emblem|logo|\.svg$/i.test(filename)
}

async function api(params: Record<string, string>): Promise<any> {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.searchParams.set('format', 'json')
  url.searchParams.set('action', 'query')
  url.searchParams.set('redirects', '1')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`MediaWiki HTTP ${res.status}`)
  return res.json()
}

async function pageImage(title: string): Promise<{ url: string; width: number; height: number; file: string } | null> {
  const data = await api({ prop: 'pageimages', piprop: 'thumbnail|original|name', pithumbsize: String(THUMB), titles: title })
  const pages = data?.query?.pages ?? {}
  for (const id of Object.keys(pages)) {
    const p = pages[id]
    if (id === '-1' || p.missing !== undefined) continue
    const file: string = p.pageimage ?? ''
    if (!file || isBadImage(file)) continue
    const thumb = p.thumbnail
    const orig = p.original
    if (!thumb?.source) continue
    return { url: thumb.source, width: thumb.width, height: thumb.height, file }
  }
  return null
}

async function attribution(file: string): Promise<{ attribution: string; license: string; sourceUrl: string }> {
  try {
    const data = await api({ prop: 'imageinfo', iiprop: 'extmetadata|url', titles: `File:${file}` })
    const pages = data?.query?.pages ?? {}
    const p = Object.values(pages)[0] as any
    const ii = p?.imageinfo?.[0]
    const meta = ii?.extmetadata ?? {}
    const artist = meta.Artist?.value ? stripHtml(meta.Artist.value) : 'Wikimedia Commons'
    const license = meta.LicenseShortName?.value ? stripHtml(meta.LicenseShortName.value) : 'CC / public domain'
    const sourceUrl = ii?.descriptionurl ?? `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`
    return { attribution: artist.slice(0, 80), license, sourceUrl }
  } catch {
    return { attribution: 'Wikimedia Commons', license: 'CC / public domain', sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function resolveDestination(slug: string, name: string, district: string, state: string): Promise<ImageResult | null> {
  const base = name.replace(/\s*\(.*?\)\s*/g, '').trim()
  const paren = name.match(/\(([^)]+)\)/)?.[1]?.trim()
  const candidates = [
    OVERRIDE[slug],
    base,
    paren,
    `${base}, ${state}`,
    district,
  ].filter(Boolean) as string[]

  for (const title of candidates) {
    try {
      const img = await pageImage(title)
      if (img) {
        const attr = await attribution(img.file)
        return { url: img.url, width: img.width, height: img.height, ...attr }
      }
    } catch (e) {
      console.warn(`  ${slug}: "${title}" failed - ${(e as Error).message}`)
    }
    await sleep(120)
  }
  return null
}

async function main() {
  console.log(`Fetching Wikipedia images for ${DESTINATIONS.length} destinations…`)
  const out: Record<string, ImageResult> = {}
  const misses: string[] = []

  for (const d of DESTINATIONS) {
    const r = await resolveDestination(d.slug, d.name, d.district, d.state)
    if (r) {
      out[d.slug] = r
      console.log(`  ✓ ${d.slug.padEnd(20)} ${r.url.split('/').pop()?.slice(0, 40)}`)
    } else {
      misses.push(d.slug)
      console.log(`  ✗ ${d.slug.padEnd(20)} (no suitable image)`)
    }
    await sleep(120)
  }

  const header = `// AUTO-GENERATED by scripts/fetch-destination-images.ts - do not edit by hand.
// Source: Wikipedia / Wikimedia Commons (keyless MediaWiki API). Generated: ${new Date().toISOString().slice(0, 10)}
// ${Object.keys(out).length}/${DESTINATIONS.length} destinations have an image. Images are CC-licensed;
// 'attribution' + 'license' + 'sourceUrl' are stored so the UI can credit authors.
// Re-run: npx tsx scripts/fetch-destination-images.ts

export interface DestinationImage {
  url: string
  width: number
  height: number
  attribution: string
  license: string
  sourceUrl: string
}

export const DESTINATION_IMAGES: Record<string, DestinationImage> = ${JSON.stringify(out, null, 2)}

export function destinationImage(slug: string): DestinationImage | undefined {
  return DESTINATION_IMAGES[slug]
}
`

  const outPath = resolve(import.meta.dirname, '../lib/data/destination-images.ts')
  writeFileSync(outPath, header)
  console.log(`\nWrote ${outPath}`)
  console.log(`Hits: ${Object.keys(out).length} | Misses: ${misses.length}${misses.length ? ' -> ' + misses.join(', ') : ''}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
