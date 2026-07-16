'use client'

import { useActionState } from 'react'
import { signInAction, type AuthState } from '@/app/admin/auth-actions'
import { fieldClass, labelClass, Notice, SubmitButton } from '@/components/admin/ui'

export function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signInAction, {})

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={fieldClass}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>

      <Notice state={state} />

      <SubmitButton pendingLabel="Signing in..." className="w-full justify-center">
        Sign in
      </SubmitButton>
    </form>
  )
}
