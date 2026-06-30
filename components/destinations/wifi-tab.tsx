import type { WifiReading, PowerReport } from '@/lib/types/database'
import type { WifiSummary } from '@/lib/queries/destination'
import { Stat, EmptyState } from './ui'

interface Props {
  slug: string
  wifiList: WifiReading[]
  powerReports: PowerReport[]
  wifiSummary: WifiSummary | null
}

// WiFi tab. Renders the Supabase community WiFi layer (readings + power reports).
export function WifiTab({ slug, wifiList, powerReports, wifiSummary }: Props) {
  const summary = wifiSummary
  const avgWifi = summary?.avg_download_mbps

  return (
    <div className="space-y-5">
      {!wifiList.length ? (
        <EmptyState icon="📶" title="No WiFi readings yet" text="Run a Speedtest during your stay and add it here to help others." slug={slug} cta="Add a WiFi reading" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Avg download" value={`${avgWifi ?? '-'} Mbps`} />
            <Stat label="Readings" value={String(summary?.reading_count ?? wifiList.length)} />
            <Stat label="Last reading" value={summary?.last_reading_at ? new Date(summary.last_reading_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-'} />
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--paper)] text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                <tr>{['Area', 'Download', 'Upload', 'Provider', 'Date'].map((h) => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {wifiList.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? 'bg-[var(--paper)]/40' : ''}>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{r.locality ?? '-'}</td>
                    <td className="px-4 py-3 font-bold text-[var(--brand)]">{r.download_mbps} Mbps</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{r.upload_mbps ? `${r.upload_mbps} Mbps` : '-'}</td>
                    <td className="px-4 py-3 text-[var(--ink-soft)]">{r.provider ?? '-'}</td>
                    <td className="px-4 py-3 text-xs text-[var(--ink-soft)]">{new Date(r.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {powerReports?.length > 0 && (
            <div className="rounded-2xl border border-[var(--clay)]/30 bg-[var(--clay)]/12 p-5">
              <p className="font-semibold text-[var(--clay)]">⚡ Power reliability</p>
              {powerReports.map((p) => (
                <p key={p.id} className="mt-1 text-sm text-[var(--ink-soft)]">
                  {p.locality && <span className="font-medium">{p.locality}: </span>}
                  {p.cuts_per_week_estimate !== null && `~${p.cuts_per_week_estimate} cuts/week`}
                  {p.has_inverter_backup && ' · inverter available'}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
