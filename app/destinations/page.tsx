import { DestinationsBrowser } from '@/components/destinations/destinations-browser'
import { DESTINATIONS } from '@/lib/data/destinations'
import { getWifiBySlug } from '@/lib/queries/home'

export const revalidate = 3600

export const metadata = {
  title: 'Destinations - every South Indian hill station',
  description:
    'Browse remote-work and road-trip destinations across all of South India: hill stations, forests and gateways in Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana and Puducherry.',
}

export default async function DestinationsPage() {
  // Optional community WiFi layer, joined to the static catalogue by slug.
  const wifiSummaryBySlug = await getWifiBySlug()
  const wifiBySlug: Record<string, { avg: number | null; count: number }> = {}
  for (const [slug, w] of Object.entries(wifiSummaryBySlug)) {
    wifiBySlug[slug] = { avg: w.avg_download_mbps, count: w.reading_count }
  }

  return (
    <div>
      <section className="grain relative overflow-hidden bg-[var(--brand-deep)]">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--brand-mint)] opacity-20 blur-[110px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-mint)]">
            {DESTINATIONS.length} places across 6 states
          </p>
          <h1 className="rise mt-2 max-w-2xl font-display text-4xl tracking-tight text-white sm:text-5xl">
            Every hill station in South India, in one place.
          </h1>
          <p className="rise delay-1 mt-3 max-w-xl text-white/70">
            From the famous Nilgiris to offbeat Eastern Ghats ranges. Filter by state or type, and
            open any one for climate, season, connectivity and community WiFi data.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <DestinationsBrowser wifiBySlug={wifiBySlug} />
      </div>
    </div>
  )
}
