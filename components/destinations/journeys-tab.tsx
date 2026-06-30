import Link from 'next/link'
import type { Journey } from '@/lib/types/database'
import { EmptyState } from './ui'

const MODE_ICONS: Record<string, string> = {
  car: '🚗', bike: '🏍', bus: '🚌', train: '🚂', mixed: '🔀',
}

interface Props {
  slug: string
  destName: string
  journeys: Journey[]
}

// Getting-here tab. Renders the Supabase community journey reports.
export function JourneysTab({ slug, destName, journeys }: Props) {
  return journeys?.length ? (
    <div className="space-y-3">
      {journeys.map((j) => (
        <Link key={j.id} href={`/journeys/${j.id}`} className="card card-hover group flex items-start gap-4 p-5">
          <span className="mt-0.5 text-2xl">{MODE_ICONS[j.transport_mode]}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">{j.origin_name} to {destName}</p>
            <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
              {[j.distance_km && `${j.distance_km} km`, j.typical_duration_hours && `~${j.typical_duration_hours} hrs`, j.ghat_sections_count > 0 && `${j.ghat_sections_count} ghat`].filter(Boolean).join(' · ')}
            </p>
            {j.ghat_warnings && <p className="mt-1 text-xs text-[var(--clay)]">⚠ {j.ghat_warnings}</p>}
          </div>
          <span className="text-[var(--line)] group-hover:text-[var(--brand)]">→</span>
        </Link>
      ))}
    </div>
  ) : (
    <EmptyState icon="🗺" title="No journey reports yet" text="Drove or took a bus here? Add your route notes: ghat conditions, fuel stops, timing." slug={slug} cta="Add a journey report" />
  )
}
