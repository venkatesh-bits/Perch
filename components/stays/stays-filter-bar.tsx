'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { STAY_TYPE_LABELS, type StayType } from '@/lib/data/stays'

interface DestOption { slug: string; name: string; state: string }

interface Props {
  destinations: DestOption[]
  states: string[]
  types: StayType[]
  current: { dest: string; type: string; wifi: boolean; q: string; sort: string }
}

export function StaysFilterBar({ destinations, states, types, current }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(current.q)
  const firstRender = useRef(true)

  // Push a new query string, preserving the other filters.
  function update(patch: Partial<Props['current']>) {
    const next = { ...current, ...patch }
    const params = new URLSearchParams()
    if (next.dest && next.dest !== 'all') params.set('dest', next.dest)
    if (next.type && next.type !== 'all') params.set('type', next.type)
    if (next.wifi) params.set('wifi', '1')
    if (next.q) params.set('q', next.q)
    if (next.sort && next.sort !== 'relevance') params.set('sort', next.sort)
    router.push(params.toString() ? `/stays?${params}` : '/stays')
  }

  // Debounce the free-text search.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    const t = setTimeout(() => { if (q !== current.q) update({ q }) }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const selectClass =
    'rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-mint)]/30'

  return (
    <div className="card space-y-3 p-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        {/* Search */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or area…"
          className={`${selectClass} w-full`}
        />

        {/* Destination */}
        <select value={current.dest} onChange={(e) => update({ dest: e.target.value })} className={`${selectClass} w-full`}>
          <option value="all">All destinations</option>
          {states.map((st) => (
            <optgroup key={st} label={st}>
              {destinations
                .filter((d) => d.state === st)
                .map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
            </optgroup>
          ))}
        </select>

        {/* Type */}
        <select value={current.type} onChange={(e) => update({ type: e.target.value })} className={`${selectClass} w-full`}>
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{STAY_TYPE_LABELS[t]}</option>
          ))}
        </select>

        {/* Sort */}
        <select value={current.sort} onChange={(e) => update({ sort: e.target.value })} className={`${selectClass} w-full lg:w-auto`}>
          <option value="relevance">Sort: best match</option>
          <option value="distance">Sort: nearest</option>
          <option value="name">Sort: name (A-Z)</option>
        </select>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-[var(--ink)]">
        <input
          type="checkbox"
          checked={current.wifi}
          onChange={(e) => update({ wifi: e.target.checked })}
          className="h-4 w-4 accent-[var(--brand)]"
        />
        📶 WiFi listed only
      </label>
    </div>
  )
}
