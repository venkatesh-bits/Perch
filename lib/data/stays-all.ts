// Stays access layer over the generated open-data set. Kept server-side: the
// full list is ~470KB, so we filter on the server and only render matches rather
// than shipping everything to the browser.

import { OSM_STAYS } from './stays-osm'
import type { OsmStay, StayType } from './stays'

export const STAY_TOTALS = {
  total: OSM_STAYS.length,
  withWifi: OSM_STAYS.filter((s) => s.hasInternet).length,
  destinations: new Set(OSM_STAYS.map((s) => s.nearestDestSlug)).size,
}

/** Types actually present in the data, in a sensible display order. */
const TYPE_ORDER: StayType[] = ['homestay', 'resort', 'hotel', 'guest_house', 'apartment', 'chalet', 'hostel', 'motel']
export const STAY_TYPES_PRESENT: StayType[] = TYPE_ORDER.filter((t) =>
  OSM_STAYS.some((s) => s.type === t),
)

export function staysNearDestination(slug: string): OsmStay[] {
  return OSM_STAYS.filter((s) => s.nearestDestSlug === slug)
}

export type StaySort = 'relevance' | 'name' | 'distance'

export interface StayQuery {
  dest?: string
  type?: string
  wifi?: boolean
  q?: string
  sort?: StaySort
}

/** Server-side filter + sort over the full open-data set. */
export function filterStays(f: StayQuery): OsmStay[] {
  let r = OSM_STAYS
  if (f.dest && f.dest !== 'all') r = r.filter((s) => s.nearestDestSlug === f.dest)
  if (f.type && f.type !== 'all') r = r.filter((s) => s.type === f.type)
  if (f.wifi) r = r.filter((s) => s.hasInternet)
  if (f.q) {
    const q = f.q.trim().toLowerCase()
    r = r.filter((s) => s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q))
  }
  const sorted = [...r]
  if (f.sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
  else if (f.sort === 'distance') sorted.sort((a, b) => a.distanceToDestKm - b.distanceToDestKm)
  else sorted.sort((a, b) => (Number(!!b.hasInternet) - Number(!!a.hasInternet)) || a.distanceToDestKm - b.distanceToDestKm)
  return sorted
}
