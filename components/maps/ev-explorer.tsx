'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { OPENFREEMAP_STYLE } from '@/lib/data/places'
import {
  DISTRICT_DIRECTORY, STATES, CONNECTOR_LABELS, STATUS_LABELS,
  googleMapsUrl, districtGoogleMapsUrl, stationsInDistrict,
  E_AMRIT_URL, type EvStation, type DistrictEntry,
} from '@/lib/data/ev-stations'
import { ALL_EV_STATIONS, isOpenData, EV_TOTALS, type AnyStation } from '@/lib/data/ev-stations-all'

const SOUTH_INDIA: [number, number] = [78.5, 12.2]

/** A coordinate-based maps link is reliable even when a station has no good name. */
function mapsLinkFor(s: AnyStation): string {
  return isOpenData(s)
    ? `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`
    : googleMapsUrl(s)
}

function powerLabel(s: AnyStation): string {
  const kind = s.speed === 'fast' ? 'DC fast' : 'AC / standard'
  return s.powerKw > 0 ? `${s.powerKw} kW ${kind}` : kind
}

function pinElement(s: AnyStation): HTMLDivElement {
  const color = s.speed === 'fast' ? '#1C5240' : '#7FB89C'
  const el = document.createElement('div')
  if (isOpenData(s)) {
    // Open-data points: smaller dot, no bolt, lighter ring - visually secondary.
    el.style.cssText = `width:13px;height:13px;border-radius:50%;background:${color};
      border:2px solid #F7F4EF;box-shadow:0 1px 3px rgba(26,23,20,.3);cursor:pointer;opacity:.9;`
    return el
  }
  // Curated highlights: full teardrop with a bolt.
  el.style.cssText = `width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:${color};border:2px solid #F7F4EF;box-shadow:0 2px 6px rgba(26,23,20,.35);cursor:pointer;
    display:flex;align-items:center;justify-content:center;`
  const g = document.createElement('span')
  g.textContent = '⚡'
  g.style.cssText = 'transform:rotate(45deg);font-size:11px;line-height:1;'
  el.appendChild(g)
  return el
}

function popupHtml(s: AnyStation): string {
  const note = !isOpenData(s) && s.note ? `<p style="margin:4px 0 0;color:#6B6259;font-size:12px;">${s.note}</p>` : ''
  const tag = isOpenData(s)
    ? `<span style="display:inline-block;margin-top:6px;padding:1px 6px;border-radius:6px;background:#EFEAE2;color:#6B6259;font-size:10px;font-weight:600;">Community-mapped (${s.source.toUpperCase()})</span>`
    : `<span style="display:inline-block;margin-top:6px;padding:1px 6px;border-radius:6px;background:#1C524014;color:#1C5240;font-size:10px;font-weight:600;">Verified highlight</span>`
  return `<div style="font-family:system-ui,sans-serif;max-width:230px;">
    <p style="margin:0;font-weight:600;color:#1A1714;font-size:13px;">${s.name}</p>
    <p style="margin:2px 0 0;color:#6B6259;font-size:12px;">${s.area} · ${s.network} · ${powerLabel(s)}</p>
    ${note}<br/>${tag}
    <a href="${mapsLinkFor(s)}" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:8px;font-size:12px;font-weight:600;color:#1C5240;text-decoration:underline;">Open in Google Maps ↗</a>
  </div>`
}

export function EvExplorer() {
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [showCommunity, setShowCommunity] = useState(true)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<string, maplibregl.Marker>>({})

  const visibleStations = useMemo(() => {
    return ALL_EV_STATIONS.filter((s) => {
      if (!showCommunity && isOpenData(s)) return false
      if (stateFilter !== 'all' && s.state !== stateFilter) return false
      return true
    })
  }, [stateFilter, showCommunity])

  const visibleDistricts = useMemo(
    () => (stateFilter === 'all' ? DISTRICT_DIRECTORY : DISTRICT_DIRECTORY.filter((d) => d.state === stateFilter)),
    [stateFilter],
  )

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPENFREEMAP_STYLE,
      center: SOUTH_INDIA,
      zoom: 5.8,
      attributionControl: { compact: true },
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // sync markers to filter
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}
    const bounds = new maplibregl.LngLatBounds()
    visibleStations.forEach((s) => {
      const marker = new maplibregl.Marker({ element: pinElement(s), anchor: isOpenData(s) ? 'center' : 'bottom' })
        .setLngLat([s.lng, s.lat])
        .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml(s)))
        .addTo(map)
      markersRef.current[s.id] = marker
      bounds.extend([s.lng, s.lat])
    })
    if (visibleStations.length > 0) map.fitBounds(bounds, { padding: 60, maxZoom: 9, duration: 400 })
  }, [visibleStations])

  function focusStation(s: EvStation) {
    const map = mapRef.current
    if (!map) return
    map.flyTo({ center: [s.lng, s.lat], zoom: 11, duration: 600 })
    markersRef.current[s.id]?.togglePopup()
  }

  return (
    <div className="space-y-6">
      {/* State filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={stateFilter === 'all'} onClick={() => setStateFilter('all')}>
          All states
        </FilterChip>
        {STATES.map((s) => (
          <FilterChip key={s} active={stateFilter === s} onClick={() => setStateFilter(s)}>
            {s}
          </FilterChip>
        ))}
      </div>

      {/* Map */}
      <div ref={containerRef} className="h-[440px] overflow-hidden rounded-3xl border border-[var(--line)]" />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--ink-soft)]">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[var(--brand)]" /> DC fast</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[var(--brand-mint)]" /> AC / standard</span>
        <span className="flex items-center gap-1.5"><span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--brand)] text-[8px] text-white">⚡</span> Verified highlight</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-mint)]" /> Community-mapped</span>
        <label className="ml-auto flex cursor-pointer items-center gap-2 font-medium text-[var(--ink)]">
          <input
            type="checkbox"
            checked={showCommunity}
            onChange={(e) => setShowCommunity(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--brand)]"
          />
          Show community-mapped ({EV_TOTALS.openData})
        </label>
      </div>
      <p className="text-xs text-[var(--ink-soft)]">
        Showing <span className="font-semibold text-[var(--ink)]">{visibleStations.length}</span> stations.
        Verified highlights are hand-checked; community-mapped points come from OpenStreetMap (keyless open data) -
        confirm in the operator&apos;s app, and use each district&apos;s links below for the full live list.
      </p>

      {/* District directory */}
      <div className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">Browse by district</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleDistricts.map((d) => (
            <DistrictCard key={`${d.state}-${d.district}`} entry={d} onFocus={focusStation} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DistrictCard({ entry, onFocus }: { entry: DistrictEntry; onFocus: (s: EvStation) => void }) {
  const stations = stationsInDistrict(entry.district)
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--ink)]">{entry.district}</h3>
          <p className="text-xs text-[var(--ink-soft)]">{entry.state}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--paper-deep)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)]">
          {stations.length ? `${stations.length} mapped` : 'live links'}
        </span>
      </div>

      {entry.blurb && <p className="text-xs leading-relaxed text-[var(--ink-soft)]">{entry.blurb}</p>}

      {stations.length > 0 ? (
        <ul className="space-y-1.5">
          {stations.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => onFocus(s)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-left transition-colors hover:border-[var(--brand-mint)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[var(--ink)]">{s.name}</span>
                  <span className="block truncate text-[11px] text-[var(--ink-soft)]">
                    {s.area} · {s.connectors.map((c) => CONNECTOR_LABELS[c]).join(', ')} · {STATUS_LABELS[s.status]}
                  </span>
                </span>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                  s.speed === 'fast' ? 'bg-[var(--brand)]/10 text-[var(--brand)]' : 'bg-[var(--brand-mint)]/20 text-[var(--brand-deep)]'
                }`}>
                  {s.powerKw}kW
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink-soft)]">
          No mapped stations yet - open the live list for what&apos;s here now.
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-0.5">
        <a
          href={districtGoogleMapsUrl(entry)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--brand-deep)]"
        >
          See all on Google Maps ↗
        </a>
        <a
          href={E_AMRIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-mint)]"
        >
          e-AMRIT (govt) ↗
        </a>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--brand)] text-[var(--paper)]'
          : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--brand-mint)]'
      }`}
    >
      {children}
    </button>
  )
}
