import { Field, input, type StepProps } from './form-ui'

// Step 2: Work spots - an optional cafe / coworking / library report.
export function StepWorkSpot({ register }: StepProps) {
  return (
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
  )
}
