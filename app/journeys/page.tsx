import type { Metadata } from 'next'
import Link from 'next/link'
import { getJourneys } from '@/lib/queries/journeys'

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
  const journeys = await getJourneys(mode)

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
            !mode ? 'bg-[var(--brand)] text-[var(--space)]' : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          All modes
        </Link>
        {MODES.map((m) => (
          <Link
            key={m}
            href={`/journeys?mode=${m}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === m ? 'bg-[var(--brand)] text-[var(--space)]' : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {MODE_ICONS[m]} {m}
          </Link>
        ))}
      </div>

      {!journeys?.length ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--ink-soft)]">
          No journeys yet - add a trip report to seed the first route.
        </p>
      ) : (
        <div className="space-y-3">
          {journeys.map((j) => (
            <Link
              key={j.id}
              href={`/journeys/${j.id}`}
              className="group flex items-start gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] backdrop-blur-md px-5 py-4 hover:border-[var(--brand-mint)] hover:shadow-sm transition-all"
            >
              <span className="mt-0.5 text-2xl">{MODE_ICONS[j.transport_mode]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--ink)] group-hover:text-[var(--brand)]">
                  {j.origin_name} → {j.destination.name}
                </p>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                  {[
                    j.distance_km && `${j.distance_km} km`,
                    j.typical_duration_hours && `~${j.typical_duration_hours} hrs`,
                    j.ghat_sections_count && `${j.ghat_sections_count} ghat section${j.ghat_sections_count > 1 ? 's' : ''}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {j.ghat_warnings && (
                  <p className="mt-1 text-xs text-[var(--clay)] truncate">⚠ {j.ghat_warnings}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-[var(--ink-soft)] group-hover:text-[var(--brand)]">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
