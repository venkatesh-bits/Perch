import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search/search-bar'
import { RouteMapClient } from '@/components/maps/route-map-client'
import type { Journey, Destination, DestinationWifiSummary, WorkSpot } from '@/lib/types/database'

export const metadata: Metadata = {
  title: 'Plan a route',
  description:
    'Search a remote-work route from any South Indian city to a hill station - community road reports, distance estimates and a keyless MapLibre map.',
  // Results pages are query-param driven; no value in indexing permutations.
  robots: { index: false, follow: true },
}

interface SearchParams {
  from?: string
  from_lat?: string
  from_lng?: string
  to?: string
  to_lat?: string
  to_lng?: string
  to_slug?: string
  mode?: string
}

const MODE_ICONS: Record<string, string> = { car: '🚗', bike: '🏍', bus: '🚌', train: '🚂', mixed: '🔀' }

function elevationGradient(e: number | null): string {
  const v = e ?? 0
  if (v > 2000) return 'from-[#23413a] to-[#0f2a22]'
  if (v > 1500) return 'from-[#1c5240] to-[#143c2f]'
  if (v > 1000) return 'from-[#2a6049] to-[#1c5240]'
  return 'from-[#357a5b] to-[#1c5240]'
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const { from, to, from_lat, from_lng, to_lat, to_lng, to_slug, mode = 'car' } = params

  if (!from || !to) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 space-y-6">
        <SearchBar />
        <p className="text-center text-[var(--ink-soft)]">Pick an origin and destination to search.</p>
      </div>
    )
  }

  const supabase = await createClient()

  const destQuery = supabase.from('destinations').select('*')
  const { data: matchedDests } = await (
    to_slug
      ? destQuery.eq('slug', to_slug)
      : destQuery.ilike('name', `%${to.split('(')[0].trim()}%`)
  ).limit(1)

  const destination = (matchedDests?.[0] ?? null) as Destination | null

  const [wifiData, workSpots, journeys] = destination
    ? await Promise.all([
        supabase.from('destination_wifi_summary').select('*').eq('destination_id', destination.id).single(),
        supabase.from('work_spots').select('*').eq('destination_id', destination.id).order('wifi_rating', { ascending: false }).limit(3),
        supabase.from('journeys').select('*').eq('destination_id', destination.id).ilike('origin_name', `%${from.split(',')[0].trim()}%`).limit(5),
      ])
    : [{ data: null }, { data: [] }, { data: [] }]

  const wifi = wifiData?.data as DestinationWifiSummary | null
  const journeyList = (journeys.data as Journey[]) ?? []
  const bestJourney = journeyList[0]
  const hasCoords = !!(from_lat && from_lng && to_lat && to_lng)

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
      <SearchBar />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[var(--ink)]">{from}</span>
        <span className="text-[var(--ink-soft)]">→</span>
        <span className="font-medium text-[var(--ink)]">{to}</span>
        <span className="rounded-full bg-[var(--paper-deep)] px-2.5 py-0.5 text-xs text-[var(--ink-soft)]">
          {MODE_ICONS[mode] ?? '🚗'} {mode}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
        {/* ── Left: community data ──────────────────────────────────────────── */}
        <div className="space-y-5">
          {destination ? (
            <>
              <div className={`grain relative overflow-hidden rounded-3xl bg-gradient-to-br ${elevationGradient(destination.elevation_m)} p-6 text-white`}>
                <p className="text-sm text-white/60">{destination.state}</p>
                <h1 className="mt-1 font-display text-4xl tracking-tight">{destination.name}</h1>
                {destination.elevation_m && <p className="text-sm text-white/70">{destination.elevation_m.toLocaleString()}m elevation</p>}
                {destination.climate_notes && <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{destination.climate_notes}</p>}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/destinations/${destination.slug}`} className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30">
                    Full destination guide →
                  </Link>
                  <Link href={`/contribute?destination=${destination.id}`} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-colors hover:bg-white/90">
                    Add trip report
                  </Link>
                </div>
              </div>

              {/* WiFi */}
              {wifi ? (
                <div className="card p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[var(--ink)]">📶 WiFi conditions</p>
                    <span className="rounded-full bg-[var(--brand)]/10 px-3 py-1 text-sm font-semibold text-[var(--brand)]">
                      {wifi.avg_download_mbps} Mbps avg
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                    <div><p className="font-display text-2xl text-[var(--ink)]">{wifi.avg_download_mbps}</p><p className="text-xs text-[var(--ink-soft)]">Avg Mbps ↓</p></div>
                    <div><p className="font-display text-2xl text-[var(--ink)]">{wifi.median_download_mbps ?? '-'}</p><p className="text-xs text-[var(--ink-soft)]">Median ↓</p></div>
                    <div><p className="font-display text-2xl text-[var(--ink)]">{wifi.reading_count}</p><p className="text-xs text-[var(--ink-soft)]">Readings</p></div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--line)] p-5 text-center">
                  <p className="text-sm text-[var(--ink-soft)]">No WiFi data yet for {destination.name}.</p>
                  <Link href={`/contribute?destination=${destination.id}`} className="mt-1 inline-block text-sm text-[var(--brand)] hover:text-[var(--brand-deep)]">
                    Be the first to add a speed test →
                  </Link>
                </div>
              )}

              {/* Work spots */}
              {(workSpots.data as WorkSpot[])?.length > 0 && (
                <div className="card space-y-3 p-5">
                  <p className="font-semibold text-[var(--ink)]">💻 Work-friendly spots</p>
                  {(workSpots.data as WorkSpot[]).map((w) => (
                    <div key={w.id} className="flex items-start justify-between rounded-xl border border-[var(--line)] p-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--ink)]">{w.name}</p>
                        <p className="text-xs capitalize text-[var(--ink-soft)]">{w.type} · {w.noise_level ?? 'noise unrated'}</p>
                      </div>
                      {w.wifi_rating && <span className="text-xs font-semibold text-[var(--brand)]">{'★'.repeat(w.wifi_rating)}{'☆'.repeat(5 - w.wifi_rating)}</span>}
                    </div>
                  ))}
                  <Link href={`/destinations/${destination.slug}?tab=work`} className="block text-center text-xs text-[var(--brand)] hover:text-[var(--brand-deep)]">
                    See all work spots →
                  </Link>
                </div>
              )}

              {/* Community journeys */}
              {journeyList.length > 0 && (
                <div className="card space-y-3 p-5">
                  <p className="font-semibold text-[var(--ink)]">🗺 Community route reports</p>
                  {journeyList.map((j) => (
                    <Link key={j.id} href={`/journeys/${j.id}`} className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3 transition-colors hover:border-[var(--brand-mint)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--ink)]">{MODE_ICONS[j.transport_mode]} {j.origin_name} → {destination.name}</p>
                        <p className="text-xs text-[var(--ink-soft)]">
                          {[j.distance_km && `${j.distance_km} km`, j.typical_duration_hours && `~${j.typical_duration_hours} hrs`, j.ghat_sections_count > 0 && `${j.ghat_sections_count} ghat`].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--line)]">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center space-y-2">
              <p className="font-medium text-[var(--ink)]">No community data for {to} yet.</p>
              <p className="text-sm text-[var(--ink-soft)]">The route map is on the right. Add a trip report and yours will be first.</p>
              <Link href="/contribute" className="btn-primary mt-2 text-sm">Add a trip report</Link>
            </div>
          )}
        </div>

        {/* ── Right: map ────────────────────────────────────────────────────── */}
        <div>
          <div className="sticky top-20">
            {hasCoords ? (
              <RouteMapClient
                origin={{ lat: parseFloat(from_lat!), lng: parseFloat(from_lng!), label: from }}
                destination={{ lat: parseFloat(to_lat!), lng: parseFloat(to_lng!), label: to }}
                fromLabel={from}
                toLabel={to}
                distanceKm={bestJourney?.distance_km ?? null}
                durationHours={bestJourney?.typical_duration_hours ?? null}
              />
            ) : (
              <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-[var(--line)] text-sm text-[var(--ink-soft)]">
                Use the search box above to plot a route.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
