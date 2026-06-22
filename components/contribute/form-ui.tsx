import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { z } from 'zod'
import type { contributionSchema } from '@/lib/validations/contribution'

// Shared field chrome + prop types for the contribution wizard steps. Extracted
// so each step component (StepJourney, StepWifi, ...) stays presentational while
// the single useForm instance lives in contribute-form.tsx.

/** The form's field-values type - the schema input (pre-coercion) RHF tracks. */
export type ContributionFields = z.input<typeof contributionSchema>

/** Common props the wizard hands to every step. */
export interface StepProps {
  register: UseFormRegister<ContributionFields>
  errors: FieldErrors<ContributionFields>
}

export function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-[var(--ink)]">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function input(extra = '') {
  return `w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-mint)]/30 ${extra}`
}
