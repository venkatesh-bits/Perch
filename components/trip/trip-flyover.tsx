'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { OPENFREEMAP_STYLE } from '@/lib/data/places'
import { ROUTE_LINE, TRIP_STOPS } from '@/lib/data/kashmir-trip'

function dayMarker(day: number): HTMLDivElement {
  const el = document.createElement('div')
  el.textContent = String(day)
  el.style.cssText =
    'width:24px;height:24px;border-radius:50%;background:#1C5240;color:#F7F4EF;' +
    'border:2px solid #F7F4EF;box-shadow:0 2px 6px rgba(26,23,20,.4);' +
    'font:600 11px/20px system-ui;text-align:center;'
  return el
}

/**
 * The full circuit on one map: numbered day markers, the route line, and a
 * "fly the route" mode that glides the camera stop to stop. Honours
 * prefers-reduced-motion by jumping instead of flying.
 */
export function TripFlyover() {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const flyIdx = useRef(-1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const map = new maplibregl.Map({
      container: ref.current,
      style: OPENFREEMAP_STYLE,
      center: [75.8, 33.2],
      zoom: 6,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    for (const s of TRIP_STOPS) {
      new maplibregl.Marker({ element: dayMarker(s.day) })
        .setLngLat([s.lng, s.lat])
        .setPopup(new maplibregl.Popup({ offset: 16 }).setText(`Day ${s.day} · ${s.name}`))
        .addTo(map)
    }

    map.on('load', () => {
      map.addSource('circuit', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: ROUTE_LINE },
        },
      })
      map.addLayer({
        id: 'circuit-line',
        type: 'line',
        source: 'circuit',
        paint: { 'line-color': '#1C5240', 'line-width': 2.5, 'line-dasharray': [1.6, 1.4], 'line-opacity': 0.75 },
      })
      const bounds = ROUTE_LINE.reduce(
        (b, c) => b.extend(c as [number, number]),
        new maplibregl.LngLatBounds(ROUTE_LINE[0], ROUTE_LINE[0]),
      )
      map.fitBounds(bounds, { padding: 46, duration: 0 })
    })

    return () => {
      if (timer.current) clearTimeout(timer.current)
      map.remove()
      mapRef.current = null
    }
  }, [])

  function stopFlight() {
    if (timer.current) clearTimeout(timer.current)
    flyIdx.current = -1
    setFlying(false)
    const map = mapRef.current
    if (!map) return
    map.stop()
    const bounds = ROUTE_LINE.reduce(
      (b, c) => b.extend(c as [number, number]),
      new maplibregl.LngLatBounds(ROUTE_LINE[0], ROUTE_LINE[0]),
    )
    map.fitBounds(bounds, { padding: 46, duration: 800 })
  }

  function flyNext() {
    const map = mapRef.current
    if (!map) return
    flyIdx.current += 1
    if (flyIdx.current >= TRIP_STOPS.length) {
      stopFlight()
      return
    }
    const s = TRIP_STOPS[flyIdx.current]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      map.jumpTo({ center: [s.lng, s.lat], zoom: 9 })
    } else {
      map.flyTo({ center: [s.lng, s.lat], zoom: 9.2, speed: 0.75, curve: 1.4, essential: false })
    }
    timer.current = setTimeout(flyNext, reduced ? 1300 : 3400)
  }

  function startFlight() {
    if (flying) { stopFlight(); return }
    flyIdx.current = -1
    setFlying(true)
    flyNext()
  }

  const label = flying
    ? `Day ${Math.max(1, Math.min(flyIdx.current + 1, TRIP_STOPS.length))} of ${TRIP_STOPS.length} · tap to stop`
    : '▶ Fly the route'

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      <button
        onClick={startFlight}
        className="absolute bottom-3 left-3 z-10 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-xs font-semibold text-[var(--paper)] shadow-[var(--elev-md)] transition hover:bg-[var(--brand-deep)]"
      >
        {label}
      </button>
    </div>
  )
}
