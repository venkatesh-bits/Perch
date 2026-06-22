'use client'

import { useState, useRef, useEffect, useId, useMemo } from 'react'
import { searchPlaces, type Place } from '@/lib/data/places'

interface Props {
  placeholder: string
  places: Place[]
  onSelect: (place: Place) => void
  icon?: React.ReactNode
}

export function PlaceCombobox({ placeholder, places, onSelect, icon }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const results = useMemo(() => searchPlaces(query, places), [query, places])

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function choose(p: Place) {
    onSelect(p)
    setQuery(p.name)
    setOpen(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[active]) choose(results[active]) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={wrapRef} className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]">
          {icon}
        </span>
      )}
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={`w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 text-sm text-[var(--ink)]
          placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-mint)]/30
          ${icon ? 'pl-9 pr-4' : 'px-4'}`}
      />

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] py-1 shadow-2xl"
        >
          {results.map((p, i) => (
            <li
              key={`${p.name}-${p.lat}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(p) }}
              className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm ${
                i === active ? 'bg-[var(--paper)]' : ''
              }`}
            >
              <span className="font-medium text-[var(--ink)]">{p.name}</span>
              <span className="text-xs text-[var(--ink-soft)]">
                {p.type === 'origin' ? 'City' : 'Destination'} · {p.state}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
