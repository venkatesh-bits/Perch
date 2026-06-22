/**
 * Build-time EV charging station aggregator.
 *
 * Pulls REAL station data from keyless / free open sources and bakes it into a
 * static file (lib/data/ev-stations-osm.ts). No runtime API calls, no billing,
 * no card on file - consistent with the rest of Perch's $0 keyless architecture
 * (OpenFreeMap tiles, client-side search).
 *
 * Sources:
 *   1. OpenStreetMap via the Overpass API  - completely keyless, $0, no signup.
 *   2. Open Charge Map (OPTIONAL)          - only if OCM_API_KEY is set in env.
 *                                            Free key, no billing ever. Enriches
 *                                            coverage but is NOT required.
 *
 * Each station is normalised (operator names cleaned, power/connectors parsed)
 * and attached to its NEAREST hill-station destination so the destination pages
 * can show "charging near here".
 *
 * Run:  npx tsx scripts/fetch-ev-stations.ts
 * Then commit the regenerated lib/data/ev-stations-osm.ts.
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DESTINATIONS } from '../lib/data/destinations'
import { ORIGIN_CITIES, haversineKm } from '../lib/data/places'
import { EV_STATIONS, type Connector, type ChargerSpeed, type StationStatus } from '../lib/data/ev-stations'

// South India bounding box (south, west, north, east).
const BBOX = { s: 8.0, w: 74.0, n: 20.0, e: 85.0 }

// A station is "near" a hill station if within this many km (road trips, not as-crow).
const NEAR_DEST_KM = 40

// Two stations within this distance are treated as the same physical site.
const DEDUPE_KM = 0.15

interface NormStation {
  id: string
  name: string
  network: string
  area: string
  district: string
  state: string
  lat: number
  lng: number
  connectors: Connector[]
  powerKw: number
  speed: ChargerSpeed
  status: StationStatus
  source: 'osm' | 'ocm'
  nearestDestSlug: string | null
  distanceToDestKm: number | null
}

// ─── operator / network canonicalisation ──────────────────────────────────────
function canonicalNetwork(raw: string | undefined, brand: string | undefined): string {
  const s = `${raw ?? ''} ${brand ?? ''}`.toLowerCase()
  if (!s.trim()) return 'Community-mapped'
  const map: [RegExp, string][] = [
    [/tata/, 'Tata Power'],
    [/ather/, 'Ather'],
    [/statiq/, 'Statiq'],
    [/kseb|kerala state/, 'KSEB'],
    [/zeon/, 'Zeon'],
    [/bolt/, 'Bolt.Earth'],
    [/charge\s?mod/, 'chargeMOD'],
    [/bescom/, 'BESCOM'],
    [/shell/, 'Shell Recharge'],
    [/chargepoint|charge\s?point/, 'ChargePoint'],
    [/honda/, 'Honda e:swap'],
    [/jio|reliance/, 'Jio-bp'],
    [/relux/, 'Relux'],
    [/glida|fortum/, 'Glida'],
    [/magenta/, 'Magenta'],
    [/oneplug|one\s?plug/, 'OnePlug'],
    [/hpcl|hindustan petroleum/, 'HPCL'],
    [/bpcl|bharat petroleum/, 'BPCL'],
    [/indian\s?oil|iocl/, 'Indian Oil'],
    [/\bola\b/, 'Ola Electric'],
    [/4r|4-?r/, '4R Energy'],
    [/exicom/, 'Exicom'],
    [/sun\s?fuel|sunfuel/, 'SunFuel'],
    [/ev\s?motors|plugngo|plug\s?n\s?go/, 'EV Motors'],
    [/numocity/, 'Numocity'],
  ]
  for (const [re, name] of map) if (re.test(s)) return name
  // Fall back to a tidy title-case of the raw operator.
  const base = (raw ?? brand ?? '').trim()
  return base ? base.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 40) : 'Community-mapped'
}

// ─── power parsing (OSM tags are wildly inconsistent) ──────────────────────────
function parsePower(tags: Record<string, string>): number {
  const candidates = [
    tags['charging_station:output'],
    tags['maxpower'],
    tags['rating'],
    tags['socket:type2_combo:output'],
    tags['socket:ccs:output'],
    tags['socket:chademo:output'],
    tags['socket:type2:output'],
    tags['socket:type2_cable:output'],
  ].filter(Boolean) as string[]
  let max = 0
  for (const c of candidates) {
    const m = c.match(/([\d.]+)\s*(kw|kva|w)?/i)
    if (!m) continue
    let v = parseFloat(m[1])
    if (!isFinite(v)) continue
    const unit = (m[2] ?? 'kw').toLowerCase()
    if (unit === 'w' && v > 1000) v = v / 1000 // watts → kW
    if (v > max) max = v
  }
  return Math.round(max * 10) / 10
}

// ─── connectors from socket:* tags ─────────────────────────────────────────────
function parseConnectors(tags: Record<string, string>): Connector[] {
  const out = new Set<Connector>()
  const has = (k: string) => tags[k] && tags[k] !== 'no' && tags[k] !== '0'
  if (has('socket:type2') || has('socket:type2_cable') || has('socket:type2:output')) out.add('Type2')
  if (has('socket:type2_combo') || has('socket:ccs') || has('socket:ccs2')) out.add('CCS2')
  if (has('socket:chademo')) out.add('CHAdeMO')
  if (has('socket:bharat_dc_001') || has('socket:bharat_dc')) out.add('Bharat_DC')
  if (has('socket:bharat_ac_001') || has('socket:bharat_ac')) out.add('Bharat_AC')
  return [...out]
}

function inferSpeed(powerKw: number, connectors: Connector[]): ChargerSpeed {
  if (powerKw >= 25) return 'fast'
  if (powerKw > 0) return 'standard'
  // Unknown power: DC connectors imply fast.
  return connectors.some((c) => c === 'CCS2' || c === 'CHAdeMO' || c === 'Bharat_DC') ? 'fast' : 'standard'
}

function inferStatus(tags: Record<string, string>): StationStatus {
  const access = (tags['access'] ?? '').toLowerCase()
  if (access === 'private') return 'guests_only'
  if (access === 'customers' || access === 'permissive') return 'guests_only'
  return 'public'
}

// Reference points with reliable state + district labels (cities first, then dests).
const REF_POINTS = [
  ...ORIGIN_CITIES.map((c) => ({ lat: c.lat, lng: c.lng, state: c.state, label: c.name })),
  ...DESTINATIONS.map((d) => ({ lat: d.lat, lng: d.lng, state: d.state, label: d.district })),
]

function nearestRef(lat: number, lng: number) {
  let best = REF_POINTS[0]
  let bestD = Infinity
  for (const r of REF_POINTS) {
    const dist = haversineKm({ lat, lng }, r)
    if (dist < bestD) { bestD = dist; best = r }
  }
  return { ...best, distKm: bestD }
}

function nearestDestination(lat: number, lng: number) {
  let slug: string | null = null
  let bestD = Infinity
  for (const d of DESTINATIONS) {
    const dist = haversineKm({ lat, lng }, d)
    if (dist < bestD) { bestD = dist; slug = d.slug }
  }
  return { slug: bestD <= NEAR_DEST_KM ? slug : null, distKm: bestD <= NEAR_DEST_KM ? Math.round(bestD) : null }
}

// ─── OVERPASS (keyless) ────────────────────────────────────────────────────────
async function fetchOverpass(): Promise<NormStation[]> {
  const query = `[out:json][timeout:120];
(
  node["amenity"="charging_station"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
  way["amenity"="charging_station"](${BBOX.s},${BBOX.w},${BBOX.n},${BBOX.e});
);
out center tags;`
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ]
  let data: any = null
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      })
      if (!res.ok) { console.warn(`  Overpass ${ep} → HTTP ${res.status}, trying next…`); continue }
      data = await res.json()
      break
    } catch (e) {
      console.warn(`  Overpass ${ep} failed: ${(e as Error).message}, trying next…`)
    }
  }
  if (!data) throw new Error('All Overpass endpoints failed')

  const out: NormStation[] = []
  for (const el of data.elements as any[]) {
    const lat = el.lat ?? el.center?.lat
    const lng = el.lon ?? el.center?.lon
    if (typeof lat !== 'number' || typeof lng !== 'number') continue
    const tags: Record<string, string> = el.tags ?? {}
    const network = canonicalNetwork(tags.operator, tags.brand)
    const powerKw = parsePower(tags)
    const connectors = parseConnectors(tags)
    const ref = nearestRef(lat, lng)
    const dest = nearestDestination(lat, lng)
    const area = tags['addr:suburb'] || tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || ref.label
    out.push({
      id: `osm-${el.type}-${el.id}`,
      name: tags.name || `${network} charging point`,
      network,
      area,
      district: ref.label,
      state: ref.state,
      lat: Math.round(lat * 1e5) / 1e5,
      lng: Math.round(lng * 1e5) / 1e5,
      connectors,
      powerKw,
      speed: inferSpeed(powerKw, connectors),
      status: inferStatus(tags),
      source: 'osm',
      nearestDestSlug: dest.slug,
      distanceToDestKm: dest.distKm,
    })
  }
  return out
}

// ─── OPEN CHARGE MAP (optional, free key) ──────────────────────────────────────
async function fetchOCM(key: string): Promise<NormStation[]> {
  const url = new URL('https://api.openchargemap.io/v3/poi/')
  url.searchParams.set('output', 'json')
  url.searchParams.set('countrycode', 'IN')
  url.searchParams.set('boundingbox', `(${BBOX.n},${BBOX.w}),(${BBOX.s},${BBOX.e})`)
  url.searchParams.set('maxresults', '5000')
  url.searchParams.set('compact', 'true')
  url.searchParams.set('key', key)
  const res = await fetch(url)
  if (!res.ok) { console.warn(`  OCM → HTTP ${res.status}, skipping`); return [] }
  const data = (await res.json()) as any[]
  const out: NormStation[] = []
  for (const poi of data) {
    const ai = poi.AddressInfo
    if (!ai?.Latitude || !ai?.Longitude) continue
    const lat = ai.Latitude, lng = ai.Longitude
    const conns = (poi.Connections ?? []) as any[]
    const powerKw = Math.round(Math.max(0, ...conns.map((c) => c.PowerKW || 0)) * 10) / 10
    const connectors: Connector[] = []
    for (const c of conns) {
      const t = (c.ConnectionType?.Title ?? '').toLowerCase()
      if (t.includes('ccs')) connectors.push('CCS2')
      else if (t.includes('chademo')) connectors.push('CHAdeMO')
      else if (t.includes('type 2') || t.includes('type2') || t.includes('mennekes')) connectors.push('Type2')
    }
    const ref = nearestRef(lat, lng)
    const dest = nearestDestination(lat, lng)
    out.push({
      id: `ocm-${poi.ID}`,
      name: ai.Title || `${poi.OperatorInfo?.Title ?? 'EV'} charging point`,
      network: canonicalNetwork(poi.OperatorInfo?.Title, undefined),
      area: ai.Town || ref.label,
      district: ref.label,
      state: ref.state,
      lat: Math.round(lat * 1e5) / 1e5,
      lng: Math.round(lng * 1e5) / 1e5,
      connectors: [...new Set(connectors)],
      powerKw,
      speed: inferSpeed(powerKw, [...new Set(connectors)]),
      status: 'public',
      source: 'ocm',
      nearestDestSlug: dest.slug,
      distanceToDestKm: dest.distKm,
    })
  }
  return out
}

// ─── dedupe ────────────────────────────────────────────────────────────────────
function dedupe(stations: NormStation[], against: { lat: number; lng: number }[]): NormStation[] {
  const kept: NormStation[] = []
  for (const s of stations) {
    const dupeOfCurated = against.some((c) => haversineKm(s, c) < DEDUPE_KM)
    if (dupeOfCurated) continue
    const dupeOfKept = kept.some((k) => haversineKm(s, k) < DEDUPE_KM)
    if (dupeOfKept) continue
    kept.push(s)
  }
  return kept
}

// ─── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching OpenStreetMap (Overpass, keyless)…')
  const osm = await fetchOverpass()
  console.log(`  → ${osm.length} OSM stations`)

  let ocm: NormStation[] = []
  const ocmKey = process.env.OCM_API_KEY
  if (ocmKey) {
    console.log('OCM_API_KEY found - fetching Open Charge Map enrichment…')
    ocm = await fetchOCM(ocmKey)
    console.log(`  → ${ocm.length} OCM stations`)
  } else {
    console.log('No OCM_API_KEY set - skipping OCM (keyless OSM-only run). This is fine.')
  }

  // Curated stations win; drop any open-data point that duplicates them.
  const curatedPts = EV_STATIONS.map((s) => ({ lat: s.lat, lng: s.lng }))
  const merged = dedupe([...ocm, ...osm], curatedPts) // OCM first so its richer record wins ties

  // Sort: stations near a hill station first, then by power desc.
  merged.sort((a, b) => {
    if (!!a.nearestDestSlug !== !!b.nearestDestSlug) return a.nearestDestSlug ? -1 : 1
    return b.powerKw - a.powerKw
  })

  const nearDest = merged.filter((s) => s.nearestDestSlug).length
  const byState = merged.reduce<Record<string, number>>((acc, s) => {
    acc[s.state] = (acc[s.state] ?? 0) + 1
    return acc
  }, {})

  const header = `// AUTO-GENERATED by scripts/fetch-ev-stations.ts - do not edit by hand.
// Source: OpenStreetMap (Overpass, keyless)${ocmKey ? ' + Open Charge Map' : ''}.
// Generated: ${new Date().toISOString().slice(0, 10)}
// ${merged.length} open-data stations | ${nearDest} within ${NEAR_DEST_KM}km of a hill station.
// Re-run: npx tsx scripts/fetch-ev-stations.ts
//
// These complement the hand-curated EV_STATIONS in ev-stations.ts. Open data is
// community-maintained: coordinates are reliable, but names/power can be sparse.
// Always confirm in the operator's app before relying on a stop.

import type { OsmEvStation } from './ev-stations'

export const OSM_EV_STATIONS: OsmEvStation[] = ${JSON.stringify(merged, null, 0)
    .replace(/\},\{/g, '},\n  {')
    .replace(/^\[/, '[\n  ')
    .replace(/\]$/, ',\n]')}
`

  const outPath = resolve(import.meta.dirname, '../lib/data/ev-stations-osm.ts')
  writeFileSync(outPath, header)

  console.log('\nWrote', outPath)
  console.log(`Total open-data stations: ${merged.length}`)
  console.log(`Near a hill station (<=${NEAR_DEST_KM}km): ${nearDest}`)
  console.log('By state:', byState)
}

main().catch((e) => { console.error(e); process.exit(1) })
