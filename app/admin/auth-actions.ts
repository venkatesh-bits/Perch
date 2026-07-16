'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface AuthState {
  error?: string
}

/**
 * Email + password sign-in. Supabase sets the session cookie through the
 * @supabase/ssr cookie adapter, so the browser never sees a token in JS.
 */
export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // One message for every failure mode. Saying "no such user" vs "wrong
    // password" would confirm which emails have accounts.
    console.error('[admin] sign-in failed:', error.message)
    return { error: 'That email and password combination did not work.' }
  }

  // Being signed in is not the same as being an admin. /admin re-checks
  // is_admin() and sends non-admins back here with an explanation.
  redirect('/admin')
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
