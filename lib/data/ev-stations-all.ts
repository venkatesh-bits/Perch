// Combined EV station access layer: hand-curated highlights + open-data (OSM/OCM).
//
// Kept separate from ev-stations.ts so the generator script (which imports the
// curated data) never has a circular dependency on its own generated output.

import { EV_STATIONS, type EvStation, type OsmEvStation } from './ev-stations'
import { OSM_EV_STATIONS } from './ev-stations-osm'
import { haversineKm } from './places'

export type AnyStation = EvStation | OsmEvStation

/** Type guard: open-data stations carry a `source` field; curated ones do not. */
export function isOpenData(s: AnyStation): s is OsmEvStation {
  return 'source' in s
}

// Curated first so they take visual priority on the map.
export const ALL_EV_STATIONS: AnyStation[] = [...EV_STATIONS, ...OSM_EV_STATIONS]

export const EV_TOTALS = {
  curated: EV_STATIONS.length,
  openData: OSM_EV_STATIONS.length,
  total: EV_STATIONS.length + OSM_EV_STATIONS.length,
  fast: ALL_EV_STATIONS.filter((s) => s.speed === 'fast').length,
  nearHillStations: OSM_EV_STATIONS.filter((s) => s.nearestDestSlug).length,
}

function speedRank(s: AnyStation): number {
  return s.speed === 'fast' ? 0 : 1
}

/**
 * Stations near a hill station: curated stations within `radiusKm` plus every
 * open-data station the generator attached to this slug. Sorted fast-first,
 * then by power, curated ahead of open-data on ties.
 */
export function chargersNearDestination(
  slug: string,
  lat: number,
  lng: number,
  radiusKm = 40,
): AnyStation[] {
  const curated = EV_STATIONS.filter((s) => haversineKm({ lat, lng }, s) <= radiusKm)
  const open = OSM_EV_STATIONS.filter((s) => s.nearestDestSlug === slug)
  return [...curated, ...open].sort((a, b) => {
    if (speedRank(a) !== speedRank(b)) return speedRank(a) - speedRank(b)
    if (b.powerKw !== a.powerKw) return b.powerKw - a.powerKw
    return isOpenData(a) === isOpenData(b) ? 0 : isOpenData(a) ? 1 : -1
  })
}
