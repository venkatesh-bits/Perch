import { Suspense } from 'react'
import Link from 'next/link'
import { chargersNearDestination, isOpenData, type AnyStation } from '@/lib/data/ev-stations-all'
import type { HillStation } from '@/lib/data/destinations'
import { Fact } from './ui'
import { WeatherCard, WeatherSkeleton } from './weather-card'

const CATEGORY_TAG: Record<string, string> = {
  hill_station: 'Hill station', forest: 'Forest & wildlife', gateway: 'Gateway', coastal: 'Coastal',
}

function chargerPower(s: AnyStation): string {
  const kind = s.speed === 'fast' ? 'DC fast' : 'AC'
  return s.powerKw > 0 ? `${s.powerKw} kW ${kind}` : kind
}

function chargerMapsLink(s: AnyStation): string {
  return `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`
}

// Overview tab. Fully static: rendered from the catalogue and the keyless EV
// dataset, so it streams to the client immediately with no DB dependency.
export function OverviewTab({ dest }: { dest: HillStation }) {
  const nearbyChargers = chargersNearDestination(dest.slug, dest.lat, dest.lng)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">Highlights</h2>
          <ul className="mt-3 space-y-2">
            {dest.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
                <span className="mt-0.5 text-[var(--brand-mint)]">✦</span> {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">Working from here</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{dest.remoteWorkNote}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            Community WiFi readings, work spots and route reports appear in the tabs above as
            travellers contribute them.
          </p>
        </div>

        {/* ─── Charging nearby ─── */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">🔌 Charging nearby</h2>
            <Link href="/charging" className="shrink-0 text-xs font-medium text-[var(--brand)] underline">
              Full EV map →
            </Link>
          </div>
          {nearbyChargers.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              No chargers mapped within 40 km yet. Open the{' '}
              <Link href="/charging" className="font-medium text-[var(--brand)] underline">full EV map</Link>{' '}
              for live links, and plan to arrive with enough range.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                {nearbyChargers.length} charging {nearbyChargers.length === 1 ? 'point' : 'points'} within ~40 km of {dest.name}.
              </p>
              <ul className="mt-3 space-y-1.5">
                {nearbyChargers.slice(0, 6).map((s) => (
                  <li key={s.id}>
                    <a
                      href={chargerMapsLink(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] px-3 py-2 transition-colors hover:border-[var(--brand-mint)]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[var(--ink)]">{s.name}</span>
                        <span className="block truncate text-[11px] text-[var(--ink-soft)]">
                          {s.network} · {chargerPower(s)}
                          {isOpenData(s) && s.distanceToDestKm !== null ? ` · ~${s.distanceToDestKm} km` : ''}
                        </span>
                      </span>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        isOpenData(s)
                          ? 'bg-[var(--paper-deep)] text-[var(--ink-soft)]'
                          : 'bg-[var(--brand)]/10 text-[var(--brand)]'
                      }`}>
                        {isOpenData(s) ? 'Community' : 'Verified'}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              {nearbyChargers.length > 6 && (
                <Link href="/charging" className="mt-3 inline-block text-xs font-medium text-[var(--brand)] underline">
                  +{nearbyChargers.length - 6} more on the EV map
                </Link>
              )}
            </>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {/* Live weather streams in; the rest of the panel renders immediately. */}
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherCard lat={dest.lat} lng={dest.lng} name={dest.name} />
        </Suspense>
        <Fact label="Elevation" value={`${dest.elevationM.toLocaleString()} m`} />
        <Fact label="Region" value={dest.region} />
        <Fact label="District" value={`${dest.district}, ${dest.state}`} />
        <Fact label="Type" value={CATEGORY_TAG[dest.category]} />
        <Fact label="Best season" value={dest.bestSeason} />
      </div>
    </div>
  )
}
