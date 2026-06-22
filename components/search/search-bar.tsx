'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PlaceCombobox } from './place-combobox'
import { DESTINATION_PLACES, ALL_PLACES, type Place } from '@/lib/data/places'

const MODES = [
  { value: 'car',   label: '🚗 Car' },
  { value: 'bike',  label: '🏍 Bike' },
  { value: 'bus',   label: '🚌 Bus' },
  { value: 'train', label: '🚂 Train' },
] as const

type Mode = typeof MODES[number]['value']

const dotIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" fill="currentColor" />
  </svg>
)
const pinIcon = (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

export function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('car')
  const [origin, setOrigin] = useState<Place | null>(null)
  const [dest, setDest] = useState<Place | null>(null)

  const handleOrigin = useCallback((p: Place) => setOrigin(p), [])
  const handleDest = useCallback((p: Place) => setDest(p), [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!origin || !dest) return
    const params = new URLSearchParams({
      from: origin.name, from_lat: String(origin.lat), from_lng: String(origin.lng),
      to: dest.name, to_lat: String(dest.lat), to_lng: String(dest.lng), mode,
    })
    if (dest.slug) params.set('to_slug', dest.slug)
    router.push(`/search?${params}`)
  }

  return (
    <form onSubmit={handleSearch} className={`rounded-2xl bg-[var(--surface)] p-3 shadow-2xl ${className}`}>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
        <PlaceCombobox placeholder="From - any major city" places={ALL_PLACES} onSelect={handleOrigin} icon={dotIcon} />
        <div className="flex items-center justify-center text-[var(--line)]"><span className="text-lg">→</span></div>
        <PlaceCombobox placeholder="To - Coonoor, Munnar, Coorg…" places={DESTINATION_PLACES} onSelect={handleDest} icon={pinIcon} />
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === m.value
                  ? 'bg-[var(--brand)] text-[var(--paper)]'
                  : 'bg-[var(--paper-deep)] text-[var(--ink-soft)] hover:bg-[var(--line)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={!origin || !dest}
          className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition-all
            hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Search routes →
        </button>
      </div>
    </form>
  )
}
