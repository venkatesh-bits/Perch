// Server-only by construction: this pulls in next/headers (via the server
// client) and next/navigation's redirect, both of which fail to build if a
// Client Component ever imports them.
import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * The signed-in user, but only if they are an admin. Returns null otherwise.
 *
 * Two deliberate choices:
 *
 *  - `auth.getUser()`, never `auth.getSession()`. getSession() decodes whatever
 *    JWT is in the cookie without verifying it; getUser() checks it against the
 *    Auth server. A cookie is attacker-editable, so only getUser() is a fact.
 *
 *  - The admin check is `is_admin()` executed IN Postgres, the same predicate
 *    the RLS policies use. So the UI can never disagree with what the database
 *    will actually allow.
 *
 * cache() dedupes this to one round trip per request, even though the layout
 * and every page and action call it.
 */
export const getAdminUser = cache(async (): Promise<User | null> => {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return null

    const { data: admin, error: rpcErr } = await supabase.rpc('is_admin')
    if (rpcErr) {
      console.error('[admin-guard] is_admin() failed:', rpcErr.message)
      return null
    }

    return admin === true ? user : null
  } catch (e) {
    console.error('[admin-guard] unexpected error:', e)
    return null
  }
})

/**
 * Gate for admin server components and server actions: returns the admin user
 * or redirects to the login page.
 *
 * Call this inside EVERY admin page and EVERY admin server action. Proxy alone
 * is not authorization: it is an optimistic cookie check that runs before the
 * route, and per the Next.js docs a matcher change can silently drop coverage
 * of a Server Function (they are POSTs to the route that uses them). RLS is the
 * real enforcement; this is defence in depth in front of it.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}
