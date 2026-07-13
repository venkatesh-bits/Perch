import type { Metadata } from 'next'
import Link from 'next/link'
import { EV_LIVE_MAPS, EV_NETWORKS, type EvNetwork } from '@/lib/data/ev-networks'
import { DISTRICT_DIRECTORY, districtGoogleMapsUrl } from '@/lib/data/ev-stations'

export const metadata: Metadata = {
  title: 'EV charging maps',
  description:
    'Every EV charging map worth bookmarking for an India road trip - the all-network maps (PlugShare, Google Maps, the government e-AMRIT map) and each operator’s own locator (Tata, Ather, Statiq, ChargeZone, Zeon, ChargeMOD and Ola).',
}

function NetworkCard({ n }: { n: EvNetwork }) {
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover group flex flex-col p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg tracking-tight text-[var(--ink)]">{n.name}</h3>
        {n.twoWheeler ? (
          <span className="shrink-0 rounded-full bg-[var(--paper-deep)] px-2 py-0.5 text-[10px] font-medium text-[var(--ink-soft)]">
            2-wheeler first
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-soft)]">{n.blurb}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand)] transition-colors group-hover:text-[var(--brand-deep)]">
        Open the map ↗
      </span>
    </a>
  )
}

export default function ChargingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="on-dark grain relative overflow-hidden bg-[var(--ink)]">
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-[var(--brand-gold)] opacity-15 blur-[110px]" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[var(--brand-mint)] opacity-15 blur-[110px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16">
          <Link href="/" className="text-xs text-white/40 transition-colors hover:text-white/70">← Home</Link>
          <h1 className="rise mt-4 max-w-2xl font-display text-4xl leading-tight tracking-tight text-white sm:text-6xl">
            EV charging maps, <span className="italic text-[var(--brand-gold)]">straight from the source.</span>
          </h1>
          <p className="rise delay-1 mt-5 max-w-2xl text-lg text-white/70">
            We don’t keep our own list of chargers - it would be stale within a week. Instead, here are
            the maps the operators keep live themselves: the all-network maps first, then each charging
            network’s own locator. Bookmark a couple before you set off.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12 space-y-12">
        {/* All-network live maps */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Start here</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
              Maps that show every network
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
              These pull chargers from across operators into one view - the quickest way to see what’s
              actually on your route.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {EV_LIVE_MAPS.map((n) => <NetworkCard key={n.name} n={n} />)}
          </div>
        </section>

        {/* Individual networks */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">By operator</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
              Each network’s own map
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
              Most have an app with live availability - worth installing the one or two that cover your
              route before you go.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EV_NETWORKS.map((n) => <NetworkCard key={n.name} n={n} />)}
          </div>
        </section>

        {/* Search by city */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">By city</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
              Jump to a city or hill route
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
              Each opens a live Google Maps search for chargers in that area.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {DISTRICT_DIRECTORY.map((d) => (
              <a
                key={d.district}
                href={districtGoogleMapsUrl(d)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1.5 text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--brand-mint)] hover:text-[var(--ink)]"
              >
                {d.district} ↗
              </a>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
          <span className="font-semibold text-[var(--ink)]">A note on reliability.</span> Coverage and
          uptime change constantly, so always confirm a charger is live in the operator’s own app before
          you count on it - especially on the hill routes, where a single working DC charger can be an
          hour apart. Carry a backup plan and start the climb with enough range.
        </p>
      </div>
    </div>
  )
}
