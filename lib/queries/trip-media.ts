import { unstable_rethrow } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public-client'
import type { TripMedia } from '@/lib/types/database'

export interface TripMediaGrouped {
  /** Media pinned to a day, keyed by day number. */
  byDay: Record<number, TripMedia[]>
  /** Media with no day - the "From the road" gallery. */
  general: TripMedia[]
}

const EMPTY: TripMediaGrouped = { byDay: {}, general: [] }

/**
 * Uploaded photos/videos for a trip log page, grouped for rendering.
 *
 * The trip log is the source of truth for the words; this is the optional media
 * layer on top. It NEVER throws: if the table is missing, the DB is unreachable
 * or the query errors, it logs and returns empty groups so /kashmir renders
 * exactly as it did before any media existed.
 */
export async function getTripMedia(tripSlug = 'kashmir'): Promise<TripMediaGrouped> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('trip_media')
      .select('*')
      .eq('trip_slug', tripSlug)
      .order('sort', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[trip-media] query error:', error.message)
      return EMPTY
    }

    const grouped: TripMediaGrouped = { byDay: {}, general: [] }
    for (const m of (data ?? []) as TripMedia[]) {
      if (m.day === null) {
        grouped.general.push(m)
      } else {
        ;(grouped.byDay[m.day] ??= []).push(m)
      }
    }
    return grouped
  } catch (e) {
    // Re-throw Next control-flow signals so routing/rendering still works.
    unstable_rethrow(e)
    console.error('[getTripMedia] unexpected error:', e)
    return EMPTY
  }
}
