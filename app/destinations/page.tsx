import { DestinationsBrowser } from '@/components/destinations/destinations-browser'
import { DESTINATIONS } from '@/lib/data/destinations'
import { getWifiBySlug } from '@/lib/queries/home'
import { getWeatherBatch } from '@/lib/queries/weather'
import { getDestinationOverrides } from '@/lib/queries/destination-overrides'

export const revalidate = 3600

export const metadata = {
  title: 'Destinations - hill stations & high country across India',
  description:
    'Browse remote-work and road-trip destinations across India: the South Indian hills (Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, Puducherry) and the Himalaya (Jammu & Kashmir, Ladakh, Himachal Pradesh, Uttarakhand) - with live weather, wildlife and travel advisories.',
}

export default async function DestinationsPage() {
  // Optional community WiFi layer + live weather for every card, both fetched
  // server-side. Weather for all destinations is ONE batched Open-Meteo request.
  const [wifiSummaryBySlug, weatherBySlug, overrides] = await Promise.all([
    getWifiBySlug(),
    getWeatherBatch(DESTINATIONS.map((d) => ({ slug: d.slug, lat: d.lat, lng: d.lng }))),
    getDestinationOverrides(),
  ])
  const wifiBySlug: Record<string, { avg: number | null; count: number }> = {}
  for (const [slug, w] of Object.entries(wifiSummaryBySlug)) {
    wifiBySlug[slug] = { avg: w.avg_download_mbps, count: w.reading_count }
  }

  return (
    <div>
      <section className="on-dark grain relative overflow-hidden bg-[var(--brand-deep)]">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--brand-mint)] opacity-20 blur-[110px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-mint)]">
            {DESTINATIONS.length} places · South India to the Himalaya
          </p>
          <h1 className="rise mt-2 max-w-2xl font-display text-4xl tracking-tight text-white sm:text-5xl">
            Every hill town we have notes on.
          </h1>
          <p className="rise delay-1 mt-3 max-w-xl text-white/70">
            The Nilgiris and the Eastern Ghats, the valleys of Kashmir, the high passes of Ladakh, the
            peaks of Himachal and Uttarakhand. Filter by state or type, then open any town for its
            weather, climate, wildlife and anything worth knowing before you go.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Only the override map travels over the wire - the browser already
            imports the static catalogue, so the 97 entries are not duplicated
            into the RSC payload. */}
        <DestinationsBrowser
          wifiBySlug={wifiBySlug}
          weatherBySlug={weatherBySlug}
          overrides={overrides}
        />
      </div>
    </div>
  )
}
