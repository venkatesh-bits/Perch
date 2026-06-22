import { Field, input, type StepProps } from './form-ui'

interface DestOption { slug: string; name: string; state: string }

const MODES = ['car', 'bike', 'bus', 'train', 'mixed'] as const
const MODE_LABELS: Record<string, string> = {
  car: '🚗 Car',
  bike: '🏍 Bike',
  bus: '🚌 Bus',
  train: '🚂 Train',
  mixed: '🔀 Mixed',
}

interface Props extends StepProps {
  destsByState: Record<string, DestOption[]>
  mode: string
  isRoad: boolean
  isTransit: boolean
}

// Step 0: Journey - transport mode, route basics, and mode-specific details.
export function StepJourney({ register, errors, destsByState, mode, isRoad, isTransit }: Props) {
  return (
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
  )
}
