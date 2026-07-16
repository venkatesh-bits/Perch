import { requireAdmin } from '@/lib/supabase/admin-guard'
import { getAllTripMedia } from '@/lib/queries/admin'
import { TRIP_DAYS } from '@/lib/data/kashmir-trip'
import { TripMediaManager, type DayOption } from '@/components/admin/trip-media-manager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Trip media' }

export default async function TripMediaPage() {
  // Re-checked per page - never inherited from the layout.
  await requireAdmin()

  const media = await getAllTripMedia('kashmir')

  // Day options come from the trip data itself, so they cannot drift out of
  // sync with the log.
  const days: DayOption[] = TRIP_DAYS.map((d) => ({
    day: d.day,
    label: `${d.from} → ${d.to}`,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
          Kashmir Circuit media
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          Photos and videos for <code>/kashmir</code>. Pin an item to one of the {TRIP_DAYS.length}{' '}
          days and it appears inside that day&apos;s card; leave the day blank and it lands in the
          &ldquo;From the road&rdquo; gallery at the end.
        </p>
      </div>

      <TripMediaManager media={media} days={days} />
    </div>
  )
}
