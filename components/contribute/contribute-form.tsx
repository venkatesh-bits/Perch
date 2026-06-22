'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import { contributionSchema } from '@/lib/validations/contribution'
import { createClient } from '@/lib/supabase/client'
import { StepJourney } from './step-journey'
import { StepWifi } from './step-wifi'
import { StepWorkSpot } from './step-work-spot'
import { StepReview } from './step-review'

interface DestOption { slug: string; name: string; state: string }

const STEPS = ['Journey', 'WiFi & Power', 'Work spots', 'Review'] as const

interface Props {
  destinations: DestOption[]
  prefillSlug?: string
}

export default function ContributeForm({ destinations, prefillSlug }: Props) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // useForm infers input types from the resolver; ContributionFormData is the output type used in onSubmit
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      journey: {
        destination_slug: prefillSlug ?? '',
        transport_mode: 'car',
        ghat_sections_count: 0,
        has_ev_charging_stops: false,
      },
    },
  })

  // Group destination options by state for the dropdown
  const destsByState = destinations.reduce<Record<string, DestOption[]>>((acc, d) => {
    (acc[d.state] ??= []).push(d)
    return acc
  }, {})

  const mode = watch('journey.transport_mode')
  const isRoad = mode === 'car' || mode === 'bike'
  const isTransit = mode === 'bus' || mode === 'train'

  async function onSubmit(data: z.infer<typeof contributionSchema>) {
    setSubmitting(true)
    setError(null)
    const supabase = createClient()

    try {
      // Resolve the chosen destination slug to its DB id (community data is keyed by id)
      const { data: destRow } = await supabase
        .from('destinations')
        .select('id')
        .eq('slug', data.journey.destination_slug)
        .maybeSingle()

      if (!destRow?.id) {
        setError('That destination is not set up for contributions yet. Please pick another, or check back soon.')
        setSubmitting(false)
        return
      }
      const destinationId = destRow.id as string

      // Insert journey
      const { data: journey, error: jErr } = await supabase
        .from('journeys')
        .insert({
          origin_name: data.journey.origin_name,
          destination_id: destinationId,
          transport_mode: data.journey.transport_mode,
          distance_km: data.journey.distance_km,
          typical_duration_hours: data.journey.typical_duration_hours,
          ...(isRoad && {
            fuel_stop_spacing_km: data.journey.fuel_stop_spacing_km,
            has_ev_charging_stops: data.journey.has_ev_charging_stops,
            road_surface_rating: data.journey.road_surface_rating,
            ghat_sections_count: data.journey.ghat_sections_count,
            ghat_warnings: data.journey.ghat_warnings,
          }),
          ...(isTransit && {
            operator_name: data.journey.operator_name,
            schedule_reliability: data.journey.schedule_reliability,
            booking_notes: data.journey.booking_notes,
          }),
        })
        .select('id')
        .single()

      if (jErr) throw jErr

      // Insert WiFi reading if provided
      if (data.wifi_reading?.download_mbps) {
        await supabase.from('wifi_readings').insert({
          destination_id: destinationId,
          ...data.wifi_reading,
          recorded_at: data.journey.trip_date,
        })
      }

      // Insert work spot if provided
      if (data.work_spot?.name) {
        await supabase.from('work_spots').insert({
          destination_id: destinationId,
          ...data.work_spot,
        })
      }

      // Insert contribution record
      await supabase.from('contributions').insert({
        journey_id: journey.id,
        destination_id: destinationId,
        trip_date: data.journey.trip_date,
        notes: data.general_notes,
      })

      setSubmitted(true)
    } catch (e) {
      setError('Something went wrong - please try again.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--brand-mint)] bg-[var(--brand-mint)]/15 p-8 text-center space-y-3">
        <p className="text-3xl">✓</p>
        <p className="font-display text-2xl tracking-tight text-[var(--brand-deep)]">Trip report submitted</p>
        <p className="text-sm text-[var(--ink-soft)]">
          Your data has been added to both the destination guide and the journey guide.
          Thank you.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(0) }}
          className="mt-2 text-sm font-medium text-[var(--brand)] underline"
        >
          Add another report
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-[var(--brand)]' : i < step ? 'w-4 bg-[var(--brand-mint)]' : 'w-4 bg-[var(--line)]'
              }`}
            />
          </div>
        ))}
        <span className="ml-2 text-xs text-[var(--ink-soft)]">
          {STEPS[step]}
        </span>
      </div>

      {/* ─── Step 0: Journey ──────────────────────────────────────────── */}
      {step === 0 && (
        <StepJourney
          register={register}
          errors={errors}
          destsByState={destsByState}
          mode={mode}
          isRoad={isRoad}
          isTransit={isTransit}
        />
      )}

      {/* ─── Step 1: WiFi & Power ─────────────────────────────────────── */}
      {step === 1 && <StepWifi register={register} errors={errors} />}

      {/* ─── Step 2: Work spots ──────────────────────────────────────── */}
      {step === 2 && <StepWorkSpot register={register} errors={errors} />}

      {/* ─── Step 3: Review ──────────────────────────────────────────── */}
      {step === 3 && <StepReview register={register} submitError={error} />}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="btn-ghost text-sm"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="btn-primary text-sm"
          >
            Next: {STEPS[step + 1]}
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit trip report'}
          </button>
        )}
      </div>
    </form>
  )
}
