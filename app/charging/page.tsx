import type { Metadata } from 'next'
import Link from 'next/link'
import { EvExplorer } from '@/components/maps/ev-explorer'
import { DISTRICT_DIRECTORY } from '@/lib/data/ev-stations'
import { EV_TOTALS } from '@/lib/data/ev-stations-all'

export const metadata: Metadata = {
  title: 'EV charging by district',
  description:
    'EV charging stations across South India, organised by district - Chennai, Puducherry, Coimbatore, the Nilgiris, Coorg, Munnar and more. Curated highlights on the map plus live links to the full, current list per district.',
}

export default function ChargingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-[var(--ink)]">
        <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-[var(--brand-gold)] opacity-15 blur-[110px]" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[var(--brand-mint)] opacity-15 blur-[110px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16">
          <Link href="/" className="text-xs text-white/40 transition-colors hover:text-white/70">← Home</Link>
          <h1 className="rise mt-4 max-w-2xl font-display text-4xl leading-tight tracking-tight text-white sm:text-6xl">
            EV charging, <span className="italic text-[var(--brand-gold)]">district by district.</span>
          </h1>
          <p className="rise delay-1 mt-5 max-w-xl text-lg text-white/70">
            Verified highlights plus hundreds of community-mapped points from open data, then every
            district with a one-tap link to the full, live list on Google Maps and the government
            e-AMRIT map - so you always get the current picture.
          </p>
          <div className="rise delay-2 mt-8 flex gap-8">
            {[
              { n: `${EV_TOTALS.total}+`, l: 'Mapped stations' },
              { n: EV_TOTALS.fast, l: 'DC fast chargers' },
              { n: DISTRICT_DIRECTORY.length, l: 'Districts covered' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl text-white sm:text-4xl">{s.n}</p>
                <p className="text-xs text-white/50">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <EvExplorer />

        {/* Disclaimer */}
        <p className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
          <span className="font-semibold text-[var(--ink)]">Where this data comes from.</span> A
          single city like Chennai has 130+ public chargers, and the list changes weekly - no
          hand-maintained map can be both complete and current. So we layer three honest sources:
          verified highlights from public network data (Tata Power, Statiq, Ather, Zeon, chargeMOD,
          KSEB, OnePlug, BPCL, Ola); hundreds of community-mapped points pulled from OpenStreetMap
          open data (keyless, no billing); and a one-tap link per district to the full live list on
          Google Maps and the government e-AMRIT map. Always confirm availability in the
          operator&apos;s app before you rely on a stop - and if you spot one worth adding,{' '}
          <Link href="/contribute" className="font-medium text-[var(--brand)] underline">
            let us know
          </Link>.
        </p>
      </div>
    </div>
  )
}
