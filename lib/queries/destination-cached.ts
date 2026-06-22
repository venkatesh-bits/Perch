import { cache } from 'react'
import { getDestinationCommunityData } from './destination'

/**
 * Request-scoped, deduped wrapper around getDestinationCommunityData.
 *
 * The destination page streams the community layer through several independent
 * Suspense boundaries (the active tab plus the hero WiFi badge). React cache()
 * collapses those concurrent calls for the same slug into a single Supabase
 * round-trip per request, while leaving the underlying query untouched.
 */
export const getCommunityData = cache(getDestinationCommunityData)
