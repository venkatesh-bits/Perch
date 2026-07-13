import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getJourneyById, getJourneyMeta } from '@/lib/queries/journeys'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await getJourneyMeta(id)

  if (!data) return { title: 'Journey not found' }
  const dest = data.destination
  const destName = (Array.isArray(dest) ? dest[0]?.name : dest?.name) ?? 'a hill station'
  const title = `${data.origin_name} to ${destName} by ${data.transport_mode}`
  return {
    title,
    description: `Road-trip report: ${data.origin_name} to ${destName} by ${data.transport_mode} - distance, duration, ghat sections, fuel and EV stops, contributed by travellers.`,
    alternates: { canonical: `/journeys/${id}` },
  }
}

const MODE_ICONS: Record<string, string> = { car: '🚗', bike: '🏍', bus: '🚌', train: '🚂', mixed: '🔀' }
const WAYPOINT_ICONS: Record<string, string> = {
  fuel: '⛽', ev_charging: '⚡', food: '🍽', rest: '☕',
  scenic: '🏔', caution: '⚠️', toll: '🏢',
}
const SURFACE_LABELS = ['', 'Very poor', 'Poor', 'OK', 'Good', 'Excellent']
const RELIABILITY_LABELS: Record<string, string> = {
  very_reliable: 'Very reliable',
  mostly_reliable: 'Mostly reliable',
  unreliable: 'Unreliable',
}

export default async function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { journey, waypoints } = await getJourneyById(id)

  if (!journey) notFound()

  const isRoadMode = ['car', 'bike'].includes(journey.transport_mode)
  const isTransitMode = ['bus', 'train'].includes(journey.transport_mode)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/journeys" className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink-soft)]">
          ← All journeys
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{MODE_ICONS[journey.transport_mode]}</span>
              <h1 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
                {journey.origin_name} → {journey.destination.name}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[var(--ink-soft)] capitalize">
              By {journey.transport_mode}
              {journey.distance_km && ` · ${journey.distance_km} km`}
              {journey.typical_duration_hours && ` · ~${journey.typical_duration_hours} hrs`}
            </p>
          </div>
          <Link
            href={`/contribute?destination=${journey.destination_id}`}
            className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-semibold text-[var(--paper)] hover:bg-[var(--brand-deep)]"
          >
            Add trip report
          </Link>
        </div>
      </div>

      {/* Road-specific details */}
      {isRoadMode && (
        <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] backdrop-blur-md p-5 space-y-4">
          <h2 className="font-semibold text-[var(--ink)]">Road conditions</h2>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            {journey.road_surface_rating && (
              <div>
                <p className="text-xs text-[var(--ink-soft)]">Road surface</p>
                <p className="font-medium text-[var(--ink)]">
                  {SURFACE_LABELS[journey.road_surface_rating]}
                </p>
              </div>
            )}
            {journey.ghat_sections_count > 0 && (
              <div>
                <p className="text-xs text-[var(--ink-soft)]">Ghat sections</p>
                <p className="font-medium text-[var(--ink)]">{journey.ghat_sections_count}</p>
              </div>
            )}
            {journey.fuel_stop_spacing_km && (
              <div>
                <p className="text-xs text-[var(--ink-soft)]">Fuel stop spacing</p>
                <p className="font-medium text-[var(--ink)]">
                  Every ~{journey.fuel_stop_spacing_km} km
                </p>
              </div>
            )}
          </div>
          {journey.ghat_warnings && (
            <div className="rounded-md bg-[var(--clay)]/12 px-4 py-3 text-sm text-[var(--clay)]">
              <span className="font-medium">Ghat warning: </span>
              {journey.ghat_warnings}
            </div>
          )}
          {journey.has_ev_charging_stops && (
            <p className="text-sm text-[var(--brand)]">⚡ EV charging stops available on this route</p>
          )}
        </section>
      )}

      {/* Transit-specific details */}
      {isTransitMode && (
        <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] backdrop-blur-md p-5 space-y-3">
          <h2 className="font-semibold text-[var(--ink)]">Transit details</h2>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            {journey.operator_name && (
              <div>
                <p className="text-xs text-[var(--ink-soft)]">Operator</p>
                <p className="font-medium text-[var(--ink)]">{journey.operator_name}</p>
              </div>
            )}
            {journey.schedule_reliability && (
              <div>
                <p className="text-xs text-[var(--ink-soft)]">Schedule reliability</p>
                <p className="font-medium text-[var(--ink)]">
                  {journey.schedule_reliability ? RELIABILITY_LABELS[journey.schedule_reliability] : '-'}
                </p>
              </div>
            )}
          </div>
          {journey.booking_notes && (
            <p className="text-sm text-[var(--ink-soft)]">{journey.booking_notes}</p>
          )}
        </section>
      )}

      {/* Waypoints */}
      <section className="space-y-3">
        <h2 className="font-semibold text-[var(--ink)]">Waypoints along the route</h2>
        {!waypoints?.length ? (
          <p className="text-sm text-[var(--ink-soft)]">No waypoints recorded yet.</p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--line)]" />
            {waypoints.map((w) => (
              <div key={w.id} className="relative mb-4">
                <span className="absolute -left-4 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs">
                  {WAYPOINT_ICONS[w.type]}
                </span>
                <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] backdrop-blur-md px-4 py-3">
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {w.name ?? w.type.replace('_', ' ')}
                    <span className="ml-2 text-xs capitalize text-[var(--ink-soft)]">{w.type.replace('_', ' ')}</span>
                  </p>
                  {w.notes && <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{w.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Link to destination */}
      <section className="rounded-xl bg-[var(--surface)] p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            Planning to work from {journey.destination.name}?
          </p>
          <p className="text-xs text-[var(--ink-soft)]">
            See WiFi speeds, cafes, and accommodation data.
          </p>
        </div>
        <Link
          href={`/destinations/${journey.destination.slug}`}
          className="rounded-md bg-[var(--surface)] border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)]"
        >
          View destination →
        </Link>
      </section>
    </div>
  )
}
