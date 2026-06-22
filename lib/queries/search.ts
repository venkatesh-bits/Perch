import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Journey, Destination, DestinationWifiSummary, WorkSpot } from '@/lib/types/database'

export interface SearchResultData {
  destination: Destination | null
  wifi: DestinationWifiSummary | null
  workSpots: WorkSpot[]
  journeys: Journey[]
}

const EMPTY: SearchResultData = {
  destination: null, wifi: null, workSpots: [], journeys: [],
}

interface SearchArgs {
  /** Free-text destination name (used when no slug is available). */
  to: string
  /** Catalogue slug for an exact destination match, if known. */
  toSlug?: string
  /** Origin name, used to surface matching community route reports. */
  from: string
}

/**
 * Resolve a searched destination to its community layer: WiFi summary, top work
 * spots, and route reports originating near `from`. NEVER throws: on any error
 * it logs and returns empty collections so the route map still renders.
 */
export async function getSearchResult({ to, toSlug, from }: SearchArgs): Promise<SearchResultData> {
  try {
    const supabase = await createClient()

    const destQuery = supabase.from('destinations').select('*')
    const { data: matchedDests, error: destErr } = await (
      toSlug
        ? destQuery.eq('slug', toSlug)
        : destQuery.ilike('name', `%${to.split('(')[0].trim()}%`)
    ).limit(1)

    if (destErr) console.error('[search] destination lookup error:', destErr.message)

    const destination = (matchedDests?.[0] ?? null) as Destination | null
    if (!destination) return EMPTY

    const [wifiRes, workRes, journeyRes] = await Promise.all([
      supabase.from('destination_wifi_summary').select('*').eq('destination_id', destination.id).single(),
      supabase.from('work_spots').select('*').eq('destination_id', destination.id).order('wifi_rating', { ascending: false }).limit(3),
      supabase.from('journeys').select('*').eq('destination_id', destination.id).ilike('origin_name', `%${from.split(',')[0].trim()}%`).limit(5),
    ])

    // A missing WiFi summary row is expected (not seeded), so do not log that one.
    if (workRes.error) console.error('[search] work spots query error:', workRes.error.message)
    if (journeyRes.error) console.error('[search] journeys query error:', journeyRes.error.message)

    return {
      destination,
      wifi: (wifiRes.data as DestinationWifiSummary | null) ?? null,
      workSpots: (workRes.data as WorkSpot[]) ?? [],
      journeys: (journeyRes.data as Journey[]) ?? [],
    }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getSearchResult] unexpected error:', e)
    return EMPTY
  }
}
