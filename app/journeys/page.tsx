import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Journey, Destination } from '@/lib/types/database'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Journey guides',
  description:
    'Community road-trip reports across South India - ghat warnings, fuel and EV stops, road surface and transit reliability, filterable by car, bike, bus or train.',
}

const MODE_ICONS: Record<string, string> = { car: '🚗', bike: '🏍', bus: '🚌', train: '🚂', mixed: '🔀' }
const MODES = ['car', 'bike', 'bus', 'train', 'mixed'] as const

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('journeys')
    .select('*, destination:destinations(name, slug)')
    .order('origin_name')

  if (mode && MODES.includes(mode as typeof MODES[number])) {
    query = query.eq('transport_mode', mode)
  }

  const { data: journeys } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink)]">Journeys</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Route guides with fuel stops, ghat warnings, and road condition data.
        </p>
      </div>

      {/* Mode filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/journeys"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !mode ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All modes
        </Link>
        {MODES.map((m) => (
          <Link
            key={m}
            href={`/journeys?mode=${m}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === m ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {MODE_ICONS[m]} {m}
          </Link>
        ))}
      </div>

      {!journeys?.length ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
          No journeys yet - add a trip report to seed the first route.
        </p>
      ) : (
        <div className="space-y-3">
          {(journeys as (Journey & { destination: Destination })[]).map((j) => (
            <Link
              key={j.id}
              href={`/journeys/${j.id}`}
              className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4 hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <span className="mt-0.5 text-2xl">{MODE_ICONS[j.transport_mode]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800 group-hover:text-emerald-700">
                  {j.origin_name} → {j.destination.name}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {[
                    j.distance_km && `${j.distance_km} km`,
                    j.typical_duration_hours && `~${j.typical_duration_hours} hrs`,
                    j.ghat_sections_count && `${j.ghat_sections_count} ghat section${j.ghat_sections_count > 1 ? 's' : ''}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {j.ghat_warnings && (
                  <p className="mt-1 text-xs text-amber-600 truncate">⚠ {j.ghat_warnings}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-stone-300 group-hover:text-emerald-600">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
