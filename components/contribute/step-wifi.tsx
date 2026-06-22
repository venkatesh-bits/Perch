import { Field, input, type StepProps } from './form-ui'

// Step 1: WiFi & Power - an optional speed-test reading at the destination.
export function StepWifi({ register, errors }: StepProps) {
  return (
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
  )
}
