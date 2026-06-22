'use client'

import { RouteMap } from './route-map'
import { haversineKm } from '@/lib/data/places'

interface Props {
  origin: { lat: number; lng: number; label?: string }
  destination: { lat: number; lng: number; label?: string }
  fromLabel: string
  toLabel: string
  /** Community-reported road distance/duration, if a journey exists. */
  distanceKm?: number | null
  durationHours?: number | null
}

export function RouteMapClient({ origin, destination, fromLabel, toLabel, distanceKm, durationHours }: Props) {
  const crowFlies = haversineKm(origin, destination)
  const showDistance = distanceKm ?? crowFlies
  const distanceIsEstimate = distanceKm == null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <div className="text-center">
          <p className="font-display text-2xl text-[var(--ink)]">{showDistance} km</p>
          <p className="text-xs text-[var(--ink-soft)]">{distanceIsEstimate ? 'straight-line est.' : 'road distance'}</p>
        </div>
        <div className="h-9 w-px bg-[var(--line)]" />
        <div className="text-center">
          <p className="font-display text-2xl text-[var(--ink)]">
            {durationHours ? `~${durationHours} hr` : '-'}
          </p>
          <p className="text-xs text-[var(--ink-soft)]">typical time</p>
        </div>
        <div className="h-9 w-px bg-[var(--line)]" />
        <div className="min-w-0 text-xs text-[var(--ink-soft)]">
          <p className="truncate font-medium text-[var(--ink)]">{fromLabel}</p>
          <p>↓</p>
          <p className="truncate font-medium text-[var(--ink)]">{toLabel}</p>
        </div>
      </div>

      <div className="h-[400px] overflow-hidden rounded-2xl border border-[var(--line)] lg:h-[520px]">
        <RouteMap origin={origin} destination={destination} />
      </div>

      <p className="text-center text-xs text-[var(--ink-soft)]">
        Map © OpenFreeMap · OpenStreetMap contributors · Free, no API key
        {distanceIsEstimate && ' · distance is straight-line until a trip report adds road data'}
      </p>
    </div>
  )
}
