import { Field, input, type StepProps } from './form-ui'

interface Props extends Pick<StepProps, 'register'> {
  /** Submit-time error message (from the network insert), not a field error. */
  submitError: string | null
}

// Step 3: Review - general notes plus any submit error.
export function StepReview({ register, submitError }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-soft)]">
        Almost done. Any general notes about the trip?
      </p>
      <Field label="General notes (optional)">
        <textarea
          {...register('general_notes')}
          rows={4}
          placeholder="Anything else worth knowing - road closures, seasonal tips, accommodation recommendations…"
          className={input()}
        />
      </Field>
      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}
    </div>
  )
}
