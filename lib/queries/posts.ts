import { unstable_rethrow } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public-client'
import type { Post } from '@/lib/types/database'

/**
 * Published posts, newest first.
 *
 * Uses the cookie-less public client, so the `posts_public_read` RLS policy
 * evaluates as anon and only published rows come back - the filter is enforced
 * by the database, not by this query. NEVER throws.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[posts] query error:', error.message)
      return []
    }
    return (data as Post[]) ?? []
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getPublishedPosts] unexpected error:', e)
    return []
  }
}

/** A single published post by slug, or null. */
export async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()

    if (error) {
      console.error('[posts] lookup failed:', error.message)
      return null
    }
    return (data as Post | null) ?? null
  } catch (e) {
    unstable_rethrow(e)
    console.error('[getPost] unexpected error:', e)
    return null
  }
}
