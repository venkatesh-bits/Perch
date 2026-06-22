import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DestinationWifiSummary } from '@/lib/types/database'

/**
 * Build a slug -> WiFi-summary map by joining the static catalogue (slugs) to the
 * Supabase `destination_wifi_summary` view (keyed by destination id).
 *
 * The catalogue is the source of truth, so this only adds the optional community
 * WiFi layer. It NEVER throws: on any DB error it logs and returns an empty map
 * so pages still render from the catalogue.
 */
export async function getWifiBySlug(): Promise<Record<string, DestinationWifiSummary>> {
  try {
    const supabase = await createClient()
    const [destRes, wifiRes] = await Promise.all([
      supabase.from('destinations').select('id, slug'),
      supabase.from('destination_wifi_summary').select('*'),
    ])

    if (destRes.error) console.error('[home] destinations lookup failed:', destRes.error.message)
    if (wifiRes.error) console.error('[home] wifi summary query error:', wifiRes.error.message)

    const wifiById = Object.fromEntries(
      ((wifiRes.data ?? []) as DestinationWifiSummary[]).map((w) => [w.destination_id, w]),
    )
    const wifiBySlug: Record<string, DestinationWifiSummary> = {}
    for (const d of ((destRes.data ?? []) as { id: string; slug: string }[])) {
      const w = wifiById[d.id] as DestinationWifiSummary | undefined
      if (w) wifiBySlug[d.slug] = w
    }
    return wifiBySlug
  } catch (e) {
    // Re-throw Next control-flow signals (e.g. the cookies() dynamic-rendering
    // marker) so the route is still correctly treated as dynamic.
    unstable_rethrow(e)
    console.error('[getWifiBySlug] unexpected error:', e)
    return {}
  }
}
