import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/admin-guard'
import { LoginForm } from '@/components/admin/login-form'
import { signOutAction } from '@/app/admin/auth-actions'
import { SubmitButton } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

/**
 * Single-owner sign-in. No signup link, no password reset link, no "create
 * account" - accounts are made in the Supabase dashboard by the owner.
 */
export default async function AdminLoginPage() {
  // Already an admin? Nothing to do here.
  const admin = await getAdminUser()
  if (admin) redirect('/admin')

  // Signed in but NOT an admin. Without this branch the user would bounce
  // between /admin (requireAdmin -> login) and here forever. Instead, say what
  // is wrong and offer the way out.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20">
      <div className="card p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
          Perch
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-[var(--ink)]">
          Admin sign-in
        </h1>

        {user ? (
          <div className="mt-5 space-y-4">
            <p className="rounded-xl border border-[var(--clay)]/40 bg-[var(--clay)]/10 px-3 py-2.5 text-xs leading-relaxed text-[var(--clay)]">
              You are signed in as <span className="font-semibold">{user.email}</span>, but that
              account is not an admin. Add it to the <code>admins</code> table in Supabase, then
              sign in again.
            </p>
            <form action={signOutAction}>
              <SubmitButton variant="ghost" pendingLabel="Signing out...">
                Sign out
              </SubmitButton>
            </form>
          </div>
        ) : (
          <>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">
              This panel is for the site owner. Everything behind it is enforced by row level
              security in Postgres, not by this form.
            </p>
            <div className="mt-6">
              <LoginForm />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
