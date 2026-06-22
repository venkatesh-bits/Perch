'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  DESTINATIONS, DEST_STATES, DESTINATION_CATEGORIES,
  type HillStation, type DestinationCategory,
} from '@/lib/data/destinations'

interface WifiInfo { avg: number | null; count: number }

function elevationTone(e: number): string {
  if (e > 2000) return 'from-[#23413a] to-[#0f2a22]'
  if (e > 1500) return 'from-[#1c5240] to-[#143c2f]'
  if (e > 1000) return 'from-[#2a6049] to-[#1c5240]'
  if (e > 400)  return 'from-[#357a5b] to-[#1c5240]'
  return 'from-[#2b6f7a] to-[#1c5240]'
}

const CATEGORY_TAG: Record<DestinationCategory, string> = {
  hill_station: 'Hill station',
  forest: 'Forest & wildlife',
  gateway: 'Gateway',
  coastal: 'Coastal',
}

export function DestinationsBrowser({ wifiBySlug }: { wifiBySlug: Record<string, WifiInfo> }) {
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DESTINATIONS.filter((d) => {
      if (stateFilter !== 'all' && d.state !== stateFilter) return false
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
      if (!q) return true
      return (
        d.name.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q)
      )
    })
  }, [query, stateFilter, categoryFilter])

  // Group by state, ordered by DEST_STATES
  const grouped = useMemo(() => {
    const byState = new Map<string, HillStation[]>()
    for (const d of filtered) {
      if (!byState.has(d.state)) byState.set(d.state, [])
      byState.get(d.state)!.push(d)
    }
    for (const list of byState.values()) list.sort((a, b) => b.elevationM - a.elevationM)
    return DEST_STATES.filter((s) => byState.has(s)).map((s) => ({ state: s, items: byState.get(s)! }))
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a hill station, district or region…"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-mint)]/30"
        />
        <div className="flex flex-wrap gap-2">
          <Chip active={stateFilter === 'all'} onClick={() => setStateFilter('all')}>All states</Chip>
          {DEST_STATES.map((s) => (
            <Chip key={s} active={stateFilter === s} onClick={() => setStateFilter(s)}>{s}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip small active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All types</Chip>
          {DESTINATION_CATEGORIES.map((c) => (
            <Chip key={c.id} small active={categoryFilter === c.id} onClick={() => setCategoryFilter(c.id)}>{c.label}</Chip>
          ))}
        </div>
        <p className="text-sm text-[var(--ink-soft)]">
          {filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'}
          {stateFilter !== 'all' ? ` in ${stateFilter}` : ' across South India'}
        </p>
      </div>

      {/* Grouped grid */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] p-12 text-center text-[var(--ink-soft)]">
          No destinations match that search.
        </div>
      ) : (
        grouped.map(({ state, items }) => (
          <section key={state} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">{state}</h2>
              <span className="text-xs text-[var(--ink-soft)]">{items.length} places</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((d) => {
                const wifi = wifiBySlug[d.slug]
                return (
                  <Link key={d.slug} href={`/destinations/${d.slug}`} className="card card-hover group overflow-hidden">
                    <div className={`relative h-24 bg-gradient-to-br ${elevationTone(d.elevationM)} p-4`}>
                      <div className="flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/55">
                            {d.region}
                          </span>
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                            {d.elevationM.toLocaleString()}m
                          </span>
                        </div>
                        <h3 className="font-display text-xl text-white">{d.name}</h3>
                      </div>
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[var(--paper-deep)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)]">
                          {CATEGORY_TAG[d.category]}
                        </span>
                        <span className="text-[11px] text-[var(--ink-soft)]">{d.district}</span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-[var(--ink-soft)]">{d.summary}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        {wifi?.avg ? (
                          <span className="text-xs font-semibold text-[var(--brand)]">📶 {wifi.avg} Mbps avg</span>
                        ) : (
                          <span className="text-[11px] text-[var(--ink-soft)]">Best: {d.bestSeason.split('(')[0].trim()}</span>
                        )}
                        <span className="text-[var(--line)] transition-colors group-hover:text-[var(--brand)]">→</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

function Chip({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full font-medium transition-colors ${small ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} ${
        active
          ? 'bg-[var(--brand)] text-[var(--paper)]'
          : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--brand-mint)]'
      }`}
    >
      {children}
    </button>
  )
}
