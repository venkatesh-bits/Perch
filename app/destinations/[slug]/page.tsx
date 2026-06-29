import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DestinationPinMapClient } from '@/components/maps/destination-pin-map-client'
import { getDestination, DESTINATIONS } from '@/lib/data/destinations'
import { destinationImage } from '@/lib/data/destination-images'
import { OverviewTab } from '@/components/destinations/overview-tab'
import { StaysTab } from '@/components/destinations/stays-tab'
import {
  WifiTabStream, WorkSpotsTabStream, JourneysTabStream, StaysCommunityStream, HeroWifiBadge,
} from '@/components/destinations/community-streams'
import { TabSkeleton, StaysCommunitySkeleton } from '@/components/destinations/tab-skeletons'

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

const CATEGORY_TAG: Record<string, string> = {
  hill_station: 'Hill station', high_point: 'High pass / peak', forest: 'Forest & wildlife', gateway: 'Gateway', coastal: 'Coastal',
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

  // Catalogue is the source of truth for the destination itself - this renders
  // immediately. The Supabase community layer streams in behind Suspense below.
  const dest = getDestination(slug)
  if (!dest) notFound()

  const heroImg = destinationImage(slug)

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className={`on-dark grain relative overflow-hidden bg-gradient-to-br ${elevationTone(dest.elevationM)}`}>
        {heroImg ? (
          <Image
            src={heroImg.url}
            alt={`${dest.name} landscape`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        {/* Scrim keeps the white hero text legible over any photo (bright or dark). */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/40" />
        {heroImg ? (
          <a
            href={heroImg.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-3 z-20 text-[10px] text-white/70 transition-colors hover:text-white"
          >
            📷 {heroImg.attribution} / {heroImg.license} · Wikimedia
          </a>
        ) : null}
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
                {/* WiFi avg is the only DB-backed hero piece - stream it. */}
                <Suspense fallback={null}>
                  <HeroWifiBadge slug={slug} />
                </Suspense>
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
        {/* ─── Overview (static - renders immediately) ─── */}
        {tab === 'overview' && <OverviewTab dest={dest} />}

        {/* ─── WiFi (community - streamed) ─── */}
        {tab === 'wifi' && (
          <Suspense fallback={<TabSkeleton />}>
            <WifiTabStream slug={slug} />
          </Suspense>
        )}

        {/* ─── Work spots (community - streamed) ─── */}
        {tab === 'work' && (
          <Suspense fallback={<TabSkeleton />}>
            <WorkSpotsTabStream slug={slug} />
          </Suspense>
        )}

        {/* ─── Stays (static booking links + open data, community section streamed) ─── */}
        {tab === 'stay' && (
          <StaysTab
            dest={dest}
            slug={slug}
            communitySlot={
              <Suspense fallback={<StaysCommunitySkeleton />}>
                <StaysCommunityStream slug={slug} />
              </Suspense>
            }
          />
        )}

        {/* ─── Journeys (community - streamed) ─── */}
        {tab === 'journeys' && (
          <Suspense fallback={<TabSkeleton />}>
            <JourneysTabStream slug={slug} destName={dest.name} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
