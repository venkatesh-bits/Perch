import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DestinationPinMapClient } from '@/components/maps/destination-pin-map-client'
import { getDestination, DESTINATIONS } from '@/lib/data/destinations'
import { chargersNearDestination, isOpenData, type AnyStation } from '@/lib/data/ev-stations-all'
import { staysNearDestination } from '@/lib/data/stays-all'
import { getDestinationCommunityData } from '@/lib/queries/destination'
import { StayCard as OsmStayCard } from '@/components/stays/stay-card'
import { BookingLinks } from '@/components/stays/booking-links'
import type { WorkSpot, Accommodation } from '@/lib/types/database'

export const revalidate = 3600

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = getDestination(slug)
  if (!d) return { title: 'Destination not found' }
  return {
    title: `${d.name} - remote work & road trip guide`,
    description: d.summary,
  }
}

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'wifi',      label: '📶 WiFi' },
  { id: 'work',      label: '💻 Work spots' },
  { id: 'stay',      label: '🏡 Stays' },
  { id: 'journeys',  label: '🗺 Getting here' },
] as const

const WIFI_LABEL = ['', 'Poor', 'Weak', 'OK', 'Good', 'Excellent']
const OUTLET_LABEL: Record<string, string> = {
  plenty: 'Many outlets', some: 'Some outlets', few: 'Few outlets', none: 'No outlets',
}
const NOISE_LABEL: Record<string, string> = {
  quiet: 'Quiet', moderate: 'Moderate noise', noisy: 'Noisy',
}
const MODE_ICONS: Record<string, string> = {
  car: '🚗', bike: '🏍', bus: '🚌', train: '🚂', mixed: '🔀',
}
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

function elevationTone(e: number): string {
  if (e > 2000) return 'from-[#23413a] via-[#1c5240] to-[#0f2a22]'
  if (e > 1500) return 'from-[#1c5240] via-[#1c5240] to-[#143c2f]'
  if (e > 1000) return 'from-[#2a6049] via-[#1c5240] to-[#143c2f]'
  if (e > 400)  return 'from-[#357a5b] via-[#2a6049] to-[#1c5240]'
  return 'from-[#2b6f7a] via-[#357a5b] to-[#1c5240]'
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const [{ slug }, { tab = 'overview' }] = await Promise.all([params, searchParams])

  // Catalogue is the source of truth for the destination itself.
  const dest = getDestination(slug)
  if (!dest) notFound()

  // EV chargers near this hill station (curated + open data), no DB / API needed.
  const nearbyChargers = chargersNearDestination(slug, dest.lat, dest.lng)
  // Open-data stays near this hill station (Airbnb/OTA reached via outbound links).
  const osmStays = staysNearDestination(slug)
  const placeQuery = `${dest.name}, ${dest.state}`

  // Community layer (Supabase) - typed, error-handled, never throws.
  const { wifiList, workSpots, accommodations, journeys, powerReports, wifiSummary } =
    await getDestinationCommunityData(slug)
  const summary = wifiSummary
  const avgWifi = summary?.avg_download_mbps

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className={`grain relative overflow-hidden bg-gradient-to-br ${elevationTone(dest.elevationM)}`}>
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-10">
          <Link href="/destinations" className="text-xs text-white/50 transition-colors hover:text-white/80">
            ← All destinations
          </Link>

          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 text-white">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/55">
                  {dest.region} · {dest.state}
                </p>
                <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{dest.name}</h1>
                <p className="mt-0.5 text-sm text-white/60">
                  {dest.district} · {dest.elevationM.toLocaleString()}m · {CATEGORY_TAG[dest.category]}
                </p>
              </div>

              <p className="max-w-lg text-sm leading-relaxed text-white/85">{dest.summary}</p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs text-white">
                  Best season: {dest.bestSeason}
                </span>
                {avgWifi ? (
                  <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                    {avgWifi} Mbps avg WiFi
                  </span>
                ) : null}
              </div>

              <Link href={`/contribute?destination=${slug}`} className="inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-deep)] transition-colors hover:bg-white/90">
                Add a trip report
              </Link>
            </div>

            <div className="w-full max-w-sm shrink-0">
              <DestinationPinMapClient lat={dest.lat} lng={dest.lng} label={dest.name} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tabs ─── */}
      <div className="sticky top-14 z-30 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl gap-0 overflow-x-auto px-5">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`/destinations/${slug}?tab=${t.id}`}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-[var(--brand)] text-[var(--brand)]'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* ─── Overview ─── */}
        {tab === 'overview' && (
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
              <Fact label="Elevation" value={`${dest.elevationM.toLocaleString()} m`} />
              <Fact label="Region" value={dest.region} />
              <Fact label="District" value={`${dest.district}, ${dest.state}`} />
              <Fact label="Type" value={CATEGORY_TAG[dest.category]} />
              <Fact label="Best season" value={dest.bestSeason} />
            </div>
          </div>
        )}

        {/* ─── WiFi ─── */}
        {tab === 'wifi' && (
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
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-900">⚡ Power reliability</p>
                    {powerReports.map((p) => (
                      <p key={p.id} className="mt-1 text-sm text-amber-800">
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
        )}

        {/* ─── Work spots ─── */}
        {tab === 'work' && (
          workSpots?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {workSpots.map((w) => <WorkSpotCard key={w.id} spot={w} />)}
            </div>
          ) : <EmptyState icon="💻" title="No work spots yet" text="Worked from a cafe or coworking space here? Add it so others can find it." slug={slug} cta="Add a work spot" />
        )}

        {/* ─── Stays ─── */}
        {tab === 'stay' && (
          <div className="space-y-8">
            {/* Live booking links */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--ink)]">Live availability &amp; prices</p>
                <p className="text-xs text-[var(--ink-soft)]">Jump to each provider&apos;s own search for {dest.name}.</p>
              </div>
              <BookingLinks place={placeQuery} />
            </div>

            {/* Community stays (work-from-here verified) */}
            {accommodations?.length ? (
              <div className="space-y-3">
                <h3 className="font-display text-xl tracking-tight text-[var(--ink)]">Community-verified stays</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {accommodations.map((a) => <StayCard key={a.id} stay={a} />)}
                </div>
              </div>
            ) : null}

            {/* Open-data stays */}
            {osmStays.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl tracking-tight text-[var(--ink)]">
                    {osmStays.length} {osmStays.length === 1 ? 'place' : 'places'} to stay nearby
                  </h3>
                  <Link href={`/stays?dest=${slug}`} className="shrink-0 text-xs font-medium text-[var(--brand)] underline">
                    Filter all on the Stays page →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {osmStays.slice(0, 9).map((s) => <OsmStayCard key={s.id} stay={s} />)}
                </div>
                {osmStays.length > 9 && (
                  <Link href={`/stays?dest=${slug}`} className="inline-block text-sm font-medium text-[var(--brand)] underline">
                    See all {osmStays.length} stays near {dest.name} →
                  </Link>
                )}
              </div>
            ) : (
              <EmptyState icon="🏡" title="No open-data stays mapped yet" text="Use the live booking links above, or add a stay you know with a WiFi rating." slug={slug} cta="Add a stay" />
            )}
          </div>
        )}

        {/* ─── Journeys ─── */}
        {tab === 'journeys' && (
          journeys?.length ? (
            <div className="space-y-3">
              {journeys.map((j) => (
                <Link key={j.id} href={`/journeys/${j.id}`} className="card card-hover group flex items-start gap-4 p-5">
                  <span className="mt-0.5 text-2xl">{MODE_ICONS[j.transport_mode]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">{j.origin_name} to {dest.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                      {[j.distance_km && `${j.distance_km} km`, j.typical_duration_hours && `~${j.typical_duration_hours} hrs`, j.ghat_sections_count > 0 && `${j.ghat_sections_count} ghat`].filter(Boolean).join(' · ')}
                    </p>
                    {j.ghat_warnings && <p className="mt-1 text-xs text-amber-600">⚠ {j.ghat_warnings}</p>}
                  </div>
                  <span className="text-[var(--line)] group-hover:text-[var(--brand)]">→</span>
                </Link>
              ))}
            </div>
          ) : <EmptyState icon="🗺" title="No journey reports yet" text="Drove or took a bus here? Add your route notes: ghat conditions, fuel stops, timing." slug={slug} cta="Add a journey report" />
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="card flex items-center justify-between p-4">
      <span className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">{label}</span>
      <span className="text-sm font-medium text-[var(--ink)]">{value}</span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="font-display text-2xl text-[var(--ink)]">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{label}</p>
    </div>
  )
}

function WorkSpotCard({ spot }: { spot: WorkSpot }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-[var(--ink)]">{spot.name}</p>
          <p className="text-xs capitalize text-[var(--ink-soft)]">{spot.type?.replace('_', ' ') ?? 'spot'}</p>
        </div>
        {spot.wifi_rating && (
          <span className="rounded-lg bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand)]">
            WiFi: {WIFI_LABEL[spot.wifi_rating]}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {spot.power_outlets && <Badge>{OUTLET_LABEL[spot.power_outlets]}</Badge>}
        {spot.noise_level && <Badge>{NOISE_LABEL[spot.noise_level]}</Badge>}
      </div>
      {spot.price_notes && <p className="text-xs text-[var(--ink-soft)]">{spot.price_notes}</p>}
    </div>
  )
}

function StayCard({ stay }: { stay: Accommodation }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-[var(--ink)]">{stay.name}</p>
          <p className="text-xs capitalize text-[var(--ink-soft)]">
            {stay.type?.replace('_', ' ') ?? 'accommodation'}{stay.price_range_inr && ` · ₹${stay.price_range_inr}/night`}
          </p>
        </div>
        {stay.wifi_rating && (
          <span className="rounded-lg bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand)]">
            WiFi: {WIFI_LABEL[stay.wifi_rating]}
          </span>
        )}
      </div>
      {stay.wifi_notes && <p className="text-xs text-[var(--ink-soft)]">{stay.wifi_notes}</p>}
      {stay.has_backup_power && <Badge className="border-amber-100 bg-amber-50 text-amber-700">⚡ Backup power</Badge>}
    </div>
  )
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`rounded-lg border border-[var(--line)] bg-[var(--paper)] px-2.5 py-1 text-xs text-[var(--ink-soft)] ${className}`}>{children}</span>
}

function EmptyState({ icon, title, text, slug, cta }: { icon: string; title: string; text: string; slug: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 font-semibold text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--ink-soft)]">{text}</p>
      <Link href={`/contribute?destination=${slug}`} className="btn-primary mt-4 text-sm">{cta}</Link>
    </div>
  )
}
