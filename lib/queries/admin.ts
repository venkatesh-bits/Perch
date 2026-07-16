import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OverrideMap } from '@/lib/queries/destination-overrides'
import type { DestinationOverride, Post, TripMedia } from '@/lib/types/database'

/**
 * Reads for the admin panel.
 *
 * These use the AUTHENTICATED server client (not the public one) on purpose:
 * the posts RLS policy is `published = true or is_admin()`, so only a request
 * carrying the admin's session can see drafts. Callers must still have passed
 * requireAdmin() - these functions do not authorize anything by themselves,
 * they just read what the caller's own session is allowed to read.
 *
 * Same house rule as the public queries: never throw, return empty on failure.
 */

/** Every media row for a trip, admin-ordered (day, then sort). */
export async function getAllTripMedia(tripSlug = 'kashmir'): Promise<TripMedia[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('trip_media')
      .select('*')
      .eq('trip_slug', tripSlug)
      .order('day', { ascending: true, nullsFirst: false })
      .order('sort', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[admin] trip_media query error:', error.message)
      return []
    }
    return (data as TripMedia[]) ?? []
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getAllTripMedia] unexpected error:', e)
    return []
  }
}

/** Every post including drafts. Requires an admin session for the drafts. */
export async function getAllPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[admin] posts query error:', error.message)
      return []
    }
    return (data as Post[]) ?? []
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getAllPosts] unexpected error:', e)
    return []
  }
}

/** Every destination override, keyed by slug. */
export async function getAllOverrides(): Promise<OverrideMap> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('destination_overrides').select('*')

    if (error) {
      console.error('[admin] destination_overrides query error:', error.message)
      return {}
    }
    const map: OverrideMap = {}
    for (const o of (data ?? []) as DestinationOverride[]) map[o.slug] = o
    return map
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getAllOverrides] unexpected error:', e)
    return {}
  }
}
