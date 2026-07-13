import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TRIP_DAYS, TRIP_META } from '@/lib/data/kashmir-trip'
import { TripFlyoverClient } from '@/components/trip/trip-flyover-client'
import { getWeatherBatch } from '@/lib/queries/weather'
import { WeatherChip } from '@/components/destinations/weather-chip'
import { Reveal } from '@/components/fx/reveal'

export const revalidate = 1800

// A personal trip log - keep it out of search results.
export const metadata: Metadata = {
  title: "Kashmir Circuit '26 - trip log",
  description:
    'Eleven days from Chandigarh over Sach Pass into Kishtwar and Warwan, across the Budgam meadows to Bangus, Keran and Gurez, then Kargil, Zanskar and home over Shinku La.',
  robots: { index: false, follow: false },
}

// ─── Elevation profile (highest point crossed each day) ─────────────────────
const CHART = { w: 640, h: 180, padX: 34, padTop: 26, padBottom: 30, maxM: 5500 }

function px(i: number): number {
  return CHART.padX + (i * (CHART.w - 2 * CHART.padX)) / (TRIP_DAYS.length - 1)
}
function py(m: number): number {
  const usable = CHART.h - CHART.padTop - CHART.padBottom
  return CHART.padTop + usable * (1 - m / CHART.maxM)
}

function ElevationProfile() {
  const line = TRIP_DAYS.map((d, i) => `${px(i)},${py(d.highM)}`).join(' ')
  const area = `${px(0)},${py(0)} ${line} ${px(TRIP_DAYS.length - 1)},${py(0)}`
  // Selective labels only - the two poles of the story.
  const labelled = new Set(['Sach Pass', 'Shinku La'])

  return (
    <svg
      viewBox={`0 0 ${CHART.w} ${CHART.h}`}
      className="w-full"
      role="img"
      aria-label="Elevation profile: the highest point crossed on each of the 11 days, peaking at Shinku La, 5,091 metres, on day 10"
    >
      {[1000, 3000, 5000].map((m) => (
        <g key={m}>
          <line x1={CHART.padX} x2={CHART.w - CHART.padX} y1={py(m)} y2={py(m)} stroke="var(--line)" strokeWidth="1" />
          <text x={CHART.padX - 6} y={py(m) + 3} textAnchor="end" fontSize="9" fill="var(--ink-soft)">
            {m / 1000}k m
          </text>
        </g>
      ))}
      <polygon points={area} fill="var(--brand)" opacity="0.08" />
      <polyline points={line} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {TRIP_DAYS.map((d, i) => (
        <g key={d.day}>
          <circle cx={px(i)} cy={py(d.highM)} r="4" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2">
            <title>{`Day ${d.day} · high point ${d.highName}: ${d.highM.toLocaleString()} m · night halt ${d.elevationM.toLocaleString()} m`}</title>
          </circle>
          {d.highName && labelled.has(d.highName) ? (
            <text x={px(i)} y={py(d.highM) - 9} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--ink)">
              {d.highName} · {d.highM.toLocaleString()} m
            </text>
          ) : null}
          <text x={px(i)} y={CHART.h - 10} textAnchor="middle" fontSize="9" fill="var(--ink-soft)">
            {d.day}
          </text>
        </g>
      ))}
      <text x={CHART.w / 2} y={CHART.h - 0.5} textAnchor="middle" fontSize="8.5" fill="var(--ink-soft)">
        day
      </text>
    </svg>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function KashmirTripPage() {
  const weather = await getWeatherBatch(
    TRIP_DAYS.map((d) => ({ slug: `day-${d.day}`, lat: d.lat, lng: d.lng })),
  )

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="on-dark grain relative overflow-hidden bg-[var(--brand-deep)]">
        <div className="pointer-events-none absolute -left-28 top-6 h-80 w-80 rounded-full bg-[var(--brand-mint)] opacity-20 blur-[110px]" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[var(--brand-gold)] opacity-15 blur-[110px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <p className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[var(--brand-mint)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-mint)]" />
            Trip log · {TRIP_META.dates}
          </p>
          <h1 className="rise delay-1 mt-5 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight text-white sm:text-7xl">
            The <span className="italic text-grad glow-text">Kashmir</span> Circuit.
          </h1>
          <p className="rise delay-2 mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            Eleven days, one loop: over Sach Pass into the Chenab gorge, through Warwan and the
            Budgam meadows, out along the Line of Control to Bangus, Keran and Gurez, then east
            through Kargil into Zanskar - and home over Shinku La.
          </p>
          <div className="rise delay-3 mt-8 flex flex-wrap gap-8">
            {[
              { n: `${TRIP_META.days}`, l: 'days on the road' },
              { n: `~${TRIP_META.distanceKm.toLocaleString()} km`, l: 'round trip' },
              { n: `${TRIP_META.passes}`, l: 'mountain passes' },
              { n: `${TRIP_META.maxAltM.toLocaleString()} m`, l: `high point · ${TRIP_META.maxAltName}` },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl text-white sm:text-4xl">{s.n}</p>
                <p className="mt-0.5 text-xs text-white/50">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-12">
        {/* ─── Map ─── */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">The loop</p>
              <h2 className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                Eleven days on one map
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-soft)]">Route line is illustrative, not navigation.</p>
          </div>
          <TripFlyoverClient />
        </section>

        {/* ─── Elevation ─── */}
        <Reveal>
        <section className="card p-6">
          <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">
            Highest point crossed, day by day
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            From the plains at 350 m to {TRIP_META.maxAltName} at {TRIP_META.maxAltM.toLocaleString()} m
            on day 10. Hover a dot for the day&apos;s numbers.
          </p>
          <div className="mt-4">
            <ElevationProfile />
          </div>
        </section>
        </Reveal>

        {/* ─── Day by day ─── */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Day by day</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
              The log
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
              The weather chip on each halt is live right now - useful for the drive home, and a
              nice way to check in on the valleys later.
            </p>
          </div>

          <ol className="relative space-y-5 border-l border-[var(--line)] pl-6">
            {TRIP_DAYS.map((d) => (
              <li key={d.day} className="relative">
                <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-[11px] font-semibold text-[var(--paper)]">
                  {d.day}
                </span>
                <Reveal>
                <div className="card overflow-hidden sm:flex">
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-soft)]">{d.date}</p>
                      <WeatherChip weather={weather[`day-${d.day}`]} className="!bg-[var(--brand)]/10 !text-[var(--brand)]" />
                    </div>
                    <h3 className="mt-1.5 font-display text-xl tracking-tight text-[var(--ink)]">
                      {d.from} <span className="text-[var(--ink-soft)]">→</span> {d.to}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {d.via ? (
                        <span className="rounded-full bg-[var(--paper-deep)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--ink-soft)]">
                          via {d.via}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-[var(--paper-deep)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--ink-soft)]">
                        high {d.highM.toLocaleString()} m{d.highName ? ` · ${d.highName}` : ''}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{d.story}</p>
                    {d.care?.length ? (
                      <ul className="mt-3 space-y-1">
                        {d.care.map((c) => (
                          <li key={c} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--clay)]">
                            <span className="mt-0.5 shrink-0">⚠</span> {c}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {d.slug ? (
                      <Link
                        href={`/destinations/${d.slug}`}
                        className="mt-3 inline-block text-xs font-medium text-[var(--brand)] underline"
                      >
                        Open the {d.to.split('·')[0].split('/')[0].trim()} guide →
                      </Link>
                    ) : null}
                  </div>
                  {d.image ? (
                    <div className="relative h-40 sm:h-auto sm:w-56 sm:shrink-0">
                      <Image
                        src={d.image}
                        alt={d.to}
                        fill
                        sizes="(max-width: 640px) 100vw, 224px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* ─── Footnote ─── */}
        <Reveal>
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
          <span className="font-semibold text-[var(--ink)]">The fine print that made it work.</span>{' '}
          Government photo ID at every checkpoint, a postpaid SIM (prepaid is dead in J&amp;K), cash
          for the valleys, offline maps, and a buffer day at the end that thankfully stayed unused.
          Bangus, Keran, Gurez and the Kishtwar roads deserve respect - check conditions locally
          before repeating any of this.
        </p>
        </Reveal>
      </div>
    </div>
  )
}
