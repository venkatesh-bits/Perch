import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Journey, Destination, Waypoint } from '@/lib/types/database'

const MODES = ['car', 'bike', 'bus', 'train', 'mixed'] as const
type Mode = typeof MODES[number]

/** A journey row joined to its destination's name and slug. */
export type JourneyListItem = Journey & { destination: Destination }

/**
 * List journeys (with their destination joined), optionally filtered by transport
 * mode, ordered by origin name. NEVER throws: on error it logs and returns [].
 */
export async function getJourneys(mode?: string): Promise<JourneyListItem[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('journeys')
      .select('*, destination:destinations(name, slug)')
      .order('origin_name')

    if (mode && MODES.includes(mode as Mode)) {
      query = query.eq('transport_mode', mode)
    }

    const { data, error } = await query
    if (error) {
      console.error('[journeys] list query error:', error.message)
      return []
    }
    return (data as JourneyListItem[]) ?? []
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getJourneys] unexpected error:', e)
    return []
  }
}

/** A single journey joined to richer destination fields. */
export type JourneyDetail = Journey & {
  destination: Pick<Destination, 'name' | 'slug' | 'elevation_m'>
}

export interface JourneyPageData {
  journey: JourneyDetail | null
  waypoints: Waypoint[]
}

/**
 * Fetch a single journey by id plus its ordered waypoints. Returns
 * `journey: null` when the row is missing or a query errors (the page treats
 * null as a 404). NEVER throws.
 */
export async function getJourneyById(id: string): Promise<JourneyPageData> {
  try {
    const supabase = await createClient()
    const { data: journey, error: jErr } = await supabase
      .from('journeys')
      .select('*, destination:destinations(name, slug, elevation_m)')
      .eq('id', id)
      .single()

    if (jErr) {
      console.error('[journeys] detail query error:', jErr.message)
      return { journey: null, waypoints: [] }
    }
    if (!journey) return { journey: null, waypoints: [] }

    const { data: waypoints, error: wErr } = await supabase
      .from('waypoints')
      .select('*')
      .eq('journey_id', id)
      .order('order_index')

    if (wErr) console.error('[journeys] waypoints query error:', wErr.message)

    return {
      journey: journey as JourneyDetail,
      waypoints: (waypoints as Waypoint[]) ?? [],
    }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getJourneyById] unexpected error:', e)
    return { journey: null, waypoints: [] }
  }
}

/** Minimal journey shape for metadata: origin, mode, destination name. */
export interface JourneyMeta {
  origin_name: string
  transport_mode: string
  destination: { name: string } | { name: string }[] | null
}

/**
 * Lightweight lookup for `generateMetadata` - origin, mode and destination name
 * only. Returns null when missing or on error. NEVER throws.
 */
export async function getJourneyMeta(id: string): Promise<JourneyMeta | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('journeys')
      .select('origin_name, transport_mode, destination:destinations(name)')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('[journeys] meta query error:', error.message)
      return null
    }
    return (data as JourneyMeta | null) ?? null
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getJourneyMeta] unexpected error:', e)
    return null
  }
}
