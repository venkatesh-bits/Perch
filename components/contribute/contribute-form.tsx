'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import { contributionSchema } from '@/lib/validations/contribution'
import { createClient } from '@/lib/supabase/client'

interface DestOption { slug: string; name: string; state: string }

const STEPS = ['Journey', 'WiFi & Power', 'Work spots', 'Review'] as const
const MODES = ['car', 'bike', 'bus', 'train', 'mixed'] as const
const MODE_LABELS: Record<string, string> = {
  car: '🚗 Car',
  bike: '🏍 Bike',
  bus: '🚌 Bus',
  train: '🚂 Train',
  mixed: '🔀 Mixed',
}

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
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starting from" error={errors.journey?.origin_name?.message}>
              <input
                {...register('journey.origin_name')}
                placeholder="e.g. Chennai"
                className={input()}
              />
            </Field>
            <Field label="Destination" error={errors.journey?.destination_slug?.message}>
              <select {...register('journey.destination_slug')} className={input()}>
                <option value="">Select destination</option>
                {Object.entries(destsByState).map(([state, list]) => (
                  <optgroup key={state} label={state}>
                    {list.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Trip date" error={errors.journey?.trip_date?.message}>
            <input type="date" {...register('journey.trip_date')} className={input('max-w-xs')} />
          </Field>

          <Field label="How did you travel?">
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" {...register('journey.transport_mode')} value={m} className="sr-only" />
                  <span className={`rounded-full border px-3 py-1.5 text-sm select-none ${
                    mode === m
                      ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] font-medium'
                      : 'border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--brand-mint)]'
                  }`}>
                    {MODE_LABELS[m]}
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Distance (km)" error={errors.journey?.distance_km?.message}>
              <input type="number" {...register('journey.distance_km')} placeholder="e.g. 530" className={input()} />
            </Field>
            <Field label="Duration (hours)" error={errors.journey?.typical_duration_hours?.message}>
              <input type="number" step="0.5" {...register('journey.typical_duration_hours')} placeholder="e.g. 8.5" className={input()} />
            </Field>
          </div>

          {/* Car / bike fields */}
          {isRoad && (
            <div className="space-y-4 rounded-xl bg-[var(--paper)] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">Road details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Road surface (1-5)" error={errors.journey?.road_surface_rating?.message}>
                  <input type="number" min={1} max={5} {...register('journey.road_surface_rating')} placeholder="1 = terrible, 5 = excellent" className={input()} />
                </Field>
                <Field label="Fuel stop every (km)" error={errors.journey?.fuel_stop_spacing_km?.message}>
                  <input type="number" {...register('journey.fuel_stop_spacing_km')} placeholder="e.g. 80" className={input()} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ghat sections">
                  <input type="number" min={0} {...register('journey.ghat_sections_count')} placeholder="0 if no ghats" className={input()} />
                </Field>
                <Field label="EV charging stops?">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...register('journey.has_ev_charging_stops')} className="rounded" />
                    Yes, there are EV charging stops
                  </label>
                </Field>
              </div>
              <Field label="Ghat warnings (optional)">
                <textarea
                  {...register('journey.ghat_warnings')}
                  rows={2}
                  placeholder="e.g. Mettupalayam-Coonoor: 40 hairpin bends, narrow road, avoid at night"
                  className={input()}
                />
              </Field>
            </div>
          )}

          {/* Bus / train fields */}
          {isTransit && (
            <div className="space-y-4 rounded-xl bg-[var(--paper)] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">Transit details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Operator">
                  <input {...register('journey.operator_name')} placeholder="e.g. SETC, Indian Railways" className={input()} />
                </Field>
                <Field label="Schedule reliability">
                  <select {...register('journey.schedule_reliability')} className={input()}>
                    <option value="">Select…</option>
                    <option value="very_reliable">Very reliable</option>
                    <option value="mostly_reliable">Mostly reliable</option>
                    <option value="unreliable">Unreliable</option>
                  </select>
                </Field>
              </div>
              <Field label="Booking notes">
                <textarea
                  {...register('journey.booking_notes')}
                  rows={2}
                  placeholder="e.g. Book 2 days ahead on weekends, IRCTC tatkal available"
                  className={input()}
                />
              </Field>
            </div>
          )}
        </div>
      )}

      {/* ─── Step 1: WiFi & Power ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            If you measured your internet speed at the destination, add it here. Even one
            Speedtest result helps others planning the same trip.
          </p>
          <div className="space-y-4 rounded-xl bg-[var(--paper)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">WiFi reading (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Download (Mbps)" error={errors.wifi_reading?.download_mbps?.message}>
                <input type="number" step="0.1" {...register('wifi_reading.download_mbps')} placeholder="e.g. 42.5" className={input()} />
              </Field>
              <Field label="Upload (Mbps)">
                <input type="number" step="0.1" {...register('wifi_reading.upload_mbps')} placeholder="e.g. 18.2" className={input()} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provider / carrier">
                <input {...register('wifi_reading.provider')} placeholder="e.g. Jio Fiber, Airtel, BSNL" className={input()} />
              </Field>
              <Field label="Area within destination">
                <input {...register('wifi_reading.locality')} placeholder="e.g. Coonoor town centre" className={input()} />
              </Field>
            </div>
            <Field label="Test tool used">
              <input {...register('wifi_reading.test_tool')} placeholder="e.g. Speedtest.net, fast.com" className={input()} />
            </Field>
          </div>
        </div>
      )}

      {/* ─── Step 2: Work spots ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--ink-soft)]">
            Worked from a cafe, coworking space, or hotel lobby? Add it so others can find it.
          </p>
          <div className="space-y-4 rounded-xl bg-[var(--paper)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">Work spot (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Place name">
                <input {...register('work_spot.name')} placeholder="e.g. Café Earthbound" className={input()} />
              </Field>
              <Field label="Type">
                <select {...register('work_spot.type')} className={input()}>
                  <option value="">Select…</option>
                  <option value="cafe">Cafe</option>
                  <option value="coworking">Coworking</option>
                  <option value="library">Library</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="WiFi quality (1-5)">
                <input type="number" min={1} max={5} {...register('work_spot.wifi_rating')} placeholder="5 = excellent" className={input()} />
              </Field>
              <Field label="Power outlets">
                <select {...register('work_spot.power_outlets')} className={input()}>
                  <option value="">Select…</option>
                  <option value="plenty">Plenty</option>
                  <option value="some">Some</option>
                  <option value="few">Few</option>
                  <option value="none">None</option>
                </select>
              </Field>
              <Field label="Noise level">
                <select {...register('work_spot.noise_level')} className={input()}>
                  <option value="">Select…</option>
                  <option value="quiet">Quiet</option>
                  <option value="moderate">Moderate</option>
                  <option value="noisy">Noisy</option>
                </select>
              </Field>
            </div>
            <Field label="Price / notes">
              <input {...register('work_spot.price_notes')} placeholder="e.g. Free WiFi with ₹150 min order" className={input()} />
            </Field>
          </div>
        </div>
      )}

      {/* ─── Step 3: Review ──────────────────────────────────────────── */}
      {step === 3 && (
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
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

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

function Field({
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

function input(extra = '') {
  return `w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-mint)]/30 ${extra}`
}
