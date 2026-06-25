import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SearchBar } from '@/components/search/search-bar'
import { EV_STATIONS, DISTRICT_DIRECTORY } from '@/lib/data/ev-stations'
import { DESTINATIONS, getDestination } from '@/lib/data/destinations'
import { destinationImage } from '@/lib/data/destination-images'
import { getWifiBySlug } from '@/lib/queries/home'
import { getWeatherBatch } from '@/lib/queries/weather'
import { WeatherChip } from '@/components/destinations/weather-chip'

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const FEATURED_SLUGS = ['ooty', 'kodaikanal', 'munnar', 'coorg', 'chikmagalur', 'wayanad']

const MARQUEE = [
  'Coonoor', 'Munnar', 'Coorg', 'Kodaikanal', 'Chikmagalur', 'Wayanad',
  'Ooty', 'Yercaud', 'Valparai', 'Araku Valley', 'Vagamon', 'Sakleshpur',
]

function elevationTone(e: number): string {
  if (e > 2000) return 'from-[#23413a] to-[#0f2a22]'
  if (e > 1500) return 'from-[#1c5240] to-[#143c2f]'
  if (e > 1000) return 'from-[#2a6049] to-[#1c5240]'
  return 'from-[#357a5b] to-[#1c5240]'
}

export default async function HomePage() {
  const destCount = DESTINATIONS.length
  const featuredList = FEATURED_SLUGS.map((s) => getDestination(s)!).filter(Boolean)

  // Catalogue is the source of truth; the DB adds optional WiFi data (by slug) and
  // Open-Meteo adds live weather for the featured cards in one batched request.
  const [wifiBySlug, weatherBySlug] = await Promise.all([
    getWifiBySlug(),
    getWeatherBatch(featuredList.map((d) => ({ slug: d.slug, lat: d.lat, lng: d.lng }))),
  ])

  return (
    <div>
      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section className="grain relative overflow-hidden bg-[var(--brand-deep)]">
        {/* glowing orbs */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[var(--brand-mint)] opacity-20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[var(--brand-gold)] opacity-15 blur-[120px]" />

        {/* layered mountain silhouettes */}
        <svg viewBox="0 0 1200 240" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full opacity-[0.12]" aria-hidden="true">
          <path d="M0,240 L0,150 L200,60 L380,130 L560,40 L760,120 L960,30 L1100,90 L1200,50 L1200,240 Z" fill="white" />
        </svg>
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full opacity-[0.18]" aria-hidden="true">
          <path d="M0,200 L0,170 L160,110 L340,160 L520,90 L720,150 L900,100 L1080,150 L1200,120 L1200,200 Z" fill="white" />
        </svg>

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[var(--brand-mint)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-mint)]" />
            Community-verified · {destCount ?? '28'}+ destinations · Updated by real travellers
          </div>

          <h1 className="rise delay-1 mt-6 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight text-white sm:text-7xl">
            Work from anywhere.<br />
            <span className="italic text-[var(--brand-gold)]">Worry about nothing.</span>
          </h1>

          <p className="rise delay-2 mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            WiFi speeds, ghat-road warnings, fuel and EV charging stops, and work-friendly cafes
            for South India&apos;s best hill stations - researched once, so you don&apos;t have to.
          </p>

          <div className="rise delay-3 mt-9 max-w-3xl">
            <SearchBar />
          </div>
        </div>

        {/* scrolling destination marquee */}
        <div className="marquee-mask relative z-10 border-t border-white/10 py-4">
          <div className="marquee-track gap-8 text-sm font-medium text-white/40">
            {[...MARQUEE, ...MARQUEE].map((name, i) => (
              <span key={i} className="flex items-center gap-8">
                {name}
                <span className="text-[var(--brand-gold)]/50">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-16 space-y-20">
        {/* ─── FEATURED DESTINATIONS ────────────────────────────────────────── */}
        <section className="space-y-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Where to perch</p>
              <h2 className="mt-1.5 font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
                Popular remote-work destinations
              </h2>
            </div>
            <Link href="/destinations" className="hidden text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-deep)] sm:block">
              View all →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredList.map((d, i) => {
              const wifi = wifiBySlug[d.slug]
              const img = destinationImage(d.slug)
              return (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  className={`card card-hover rise group overflow-hidden delay-${Math.min(i + 1, 4)}`}
                >
                  <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${elevationTone(d.elevationM)}`}>
                    {img ? (
                      <Image
                        src={img.thumbUrl}
                        alt={d.name}
                        fill
                        priority={i < 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    {/* Scrim keeps the white text legible over any photo. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />
                    <div className="relative flex h-full flex-col justify-between p-5">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
                          {d.state}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <WeatherChip weather={weatherBySlug[d.slug]} />
                          <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                            {d.elevationM.toLocaleString()}m
                          </span>
                        </div>
                      </div>
                      <h3 className="font-display text-2xl text-white drop-shadow-sm">{d.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <p className="line-clamp-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                      {d.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      {wifi ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)]">
                          <span className="h-2 w-2 rounded-full bg-[var(--brand-mint)]" />
                          {wifi.avg_download_mbps} Mbps avg
                        </span>
                      ) : (
                        <span className="text-sm text-[var(--ink-soft)]">Best: {d.bestSeason.split('(')[0].trim()}</span>
                      )}
                      <span className="text-[var(--line)] transition-colors group-hover:text-[var(--brand)]">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ─── EV CHARGING TEASER ───────────────────────────────────────────── */}
        <section className="grain relative overflow-hidden rounded-3xl bg-[var(--ink)] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[var(--brand-gold)] opacity-10 blur-[100px]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">New</p>
              <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
                Driving electric? <span className="italic text-[var(--brand-mint)]">We mapped the chargers.</span>
              </h2>
              <p className="max-w-md text-white/65">
                Charging stops across {DISTRICT_DIRECTORY.length} South Indian districts - Chennai,
                Puducherry, Coimbatore, the Nilgiris, Coorg, Munnar and more. Curated pins plus a
                live link to the full list in every district.
              </p>
              <Link href="/charging" className="btn-primary mt-2 bg-[var(--brand-gold)] text-[var(--ink)] hover:bg-[#cf9a2f]">
                Open the charging map →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { n: EV_STATIONS.filter((s) => s.speed === 'fast').length, l: 'Fast chargers' },
                { n: DISTRICT_DIRECTORY.length, l: 'Districts' },
                { n: `${EV_STATIONS.length}+`, l: 'Curated stops' },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="font-display text-3xl text-white">{s.n}</p>
                  <p className="mt-1 text-[11px] leading-tight text-white/50">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="space-y-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">The idea</p>
            <h2 className="mt-1.5 font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              One trip report. Two guides, kept fresh.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
            {[
              { icon: '✶', title: 'One form, two datasets', body: 'A single trip report fills the destination guide (WiFi, cafes, power) and the journey guide (route, ghat warnings, fuel & EV stops) at the same time.' },
              { icon: '◷', title: 'Dated, tagged data', body: 'Every WiFi reading carries a date and carrier tag, so you know exactly how fresh it is - not a stale screenshot from years ago.' },
              { icon: '⤳', title: 'Any way you travel', body: 'Car, bike, bus, train or EV. Each destination collects separate journey reports per mode, with mode-specific warnings and tips.' },
            ].map((item) => (
              <div key={item.title} className="space-y-3 bg-[var(--surface)] p-7">
                <span className="font-display text-3xl text-[var(--brand)]">{item.icon}</span>
                <p className="font-semibold text-[var(--ink)]">{item.title}</p>
                <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────────────────────────── */}
        <section className="grain relative overflow-hidden rounded-3xl bg-[var(--brand)] px-8 py-12 sm:px-12">
          <svg viewBox="0 0 200 200" className="pointer-events-none absolute right-0 top-0 h-full opacity-[0.08]" aria-hidden="true">
            <path d="M0,200 L50,90 L90,140 L140,40 L180,100 L200,30 L200,200 Z" fill="white" />
          </svg>
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Just back from the hills?</h2>
              <p className="mt-2 max-w-md text-white/75">
                Your WiFi speed test and road notes would help hundreds planning the same trip.
                It takes about three minutes.
              </p>
            </div>
            <Link href="/contribute" className="btn-ghost shrink-0 text-base">
              Add a trip report →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
