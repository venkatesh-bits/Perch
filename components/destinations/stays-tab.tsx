import Link from 'next/link'
import { staysNearDestination } from '@/lib/data/stays-all'
import type { HillStation } from '@/lib/data/destinations'
import type { Accommodation } from '@/lib/types/database'
import { StayCard as OsmStayCard } from '@/components/stays/stay-card'
import { BookingLinks } from '@/components/stays/booking-links'
import { StayCard, EmptyState } from './ui'

// Community-verified accommodations block. Supabase-backed, so this is the only
// part of the Stays tab that depends on the DB - it streams inside a Suspense
// boundary while the static booking links and open-data stays render instantly.
export function StaysCommunitySection({ accommodations }: { accommodations: Accommodation[] }) {
  if (!accommodations?.length) return null
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl tracking-tight text-[var(--ink)]">Community-verified stays</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {accommodations.map((a) => <StayCard key={a.id} stay={a} />)}
      </div>
    </div>
  )
}

interface Props {
  dest: HillStation
  slug: string
  /** Streamed community accommodations section (rendered between the live links and open-data stays). */
  communitySlot?: React.ReactNode
}

// Stays tab. The live booking links and open-data (OSM) stays are static and
// render immediately; the community-verified accommodations arrive via the
// streamed `communitySlot`.
export function StaysTab({ dest, slug, communitySlot }: Props) {
  const osmStays = staysNearDestination(slug)
  const placeQuery = `${dest.name}, ${dest.state}`

  return (
    <div className="space-y-8">
      {/* Live booking links */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[var(--ink)]">Live availability &amp; prices</p>
          <p className="text-xs text-[var(--ink-soft)]">Jump to each provider&apos;s own search for {dest.name}.</p>
        </div>
        <BookingLinks place={placeQuery} />
      </div>

      {/* Community stays (work-from-here verified) - streamed */}
      {communitySlot}

      {/* Open-data stays */}
      {osmStays.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl tracking-tight text-[var(--ink)]">
              {osmStays.length} {osmStays.length === 1 ? 'place' : 'places'} to stay nearby
            </h3>
            <Link href={`/stays?dest=${slug}`} className="shrink-0 text-xs font-medium text-[var(--brand)] underline">
              Filter all on the Stays page →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {osmStays.slice(0, 9).map((s) => <OsmStayCard key={s.id} stay={s} />)}
          </div>
          {osmStays.length > 9 && (
            <Link href={`/stays?dest=${slug}`} className="inline-block text-sm font-medium text-[var(--brand)] underline">
              See all {osmStays.length} stays near {dest.name} →
            </Link>
          )}
        </div>
      ) : (
        <EmptyState icon="🏡" title="No open-data stays mapped yet" text="Use the live booking links above, or add a stay you know with a WiFi rating." slug={slug} cta="Add a stay" />
      )}
    </div>
  )
}
