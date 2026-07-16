import { unstable_rethrow } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public-client'
import type { HillStation } from '@/lib/data/destinations'
import type { DestinationOverride } from '@/lib/types/database'

export type OverrideMap = Record<string, DestinationOverride>

/**
 * Every destination override, keyed by slug.
 *
 * The static catalogue (lib/data/destinations.ts) stays the source of truth;
 * this is a thin edit layer over it. NEVER throws - on any failure it logs and
 * returns {}, which means "every destination renders its static default".
 */
export async function getDestinationOverrides(): Promise<OverrideMap> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('destination_overrides').select('*')

    if (error) {
      console.error('[destination-overrides] query error:', error.message)
      return {}
    }

    const map: OverrideMap = {}
    for (const o of (data ?? []) as DestinationOverride[]) map[o.slug] = o
    return map
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getDestinationOverrides] unexpected error:', e)
    return {}
  }
}

/** A single destination's override, or null when there is none. */
export async function getDestinationOverride(
  slug: string,
): Promise<DestinationOverride | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('destination_overrides')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[destination-overrides] lookup failed:', error.message)
      return null
    }
    return (data as DestinationOverride | null) ?? null
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getDestinationOverride] unexpected error:', e)
    return null
  }
}

/**
 * Merge an override over a static destination. Only non-empty fields win, so a
 * blank override column always falls back to the catalogue default.
 */
export function applyOverride(
  dest: HillStation,
  override: DestinationOverride | null | undefined,
): HillStation {
  if (!override) return dest
  return {
    ...dest,
    summary: override.summary?.trim() ? override.summary : dest.summary,
    remoteWorkNote: override.remote_work_note?.trim()
      ? override.remote_work_note
      : dest.remoteWorkNote,
  }
}

/** The hero/card image for a destination: override first, else the static one. */
export function overrideImageUrl(
  override: DestinationOverride | null | undefined,
): string | null {
  return override?.image_url?.trim() ? override.image_url : null
}
