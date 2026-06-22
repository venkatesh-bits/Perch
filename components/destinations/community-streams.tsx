import { getCommunityData } from '@/lib/queries/destination-cached'
import { WifiTab } from './wifi-tab'
import { WorkSpotsTab } from './work-spots-tab'
import { JourneysTab } from './journeys-tab'
import { StaysCommunitySection } from './stays-tab'

// Async Server Components that await the Supabase community layer. Each is
// rendered inside a <Suspense> boundary on the destination page, so the static
// catalogue content paints first and these stream in when the DB responds.
//
// getCommunityData is wrapped in React cache(), so the multiple
// awaits below (active tab + hero badge) dedupe to a single query per request.

export async function WifiTabStream({ slug }: { slug: string }) {
  const { wifiList, powerReports, wifiSummary } = await getCommunityData(slug)
  return <WifiTab slug={slug} wifiList={wifiList} powerReports={powerReports} wifiSummary={wifiSummary} />
}

export async function WorkSpotsTabStream({ slug }: { slug: string }) {
  const { workSpots } = await getCommunityData(slug)
  return <WorkSpotsTab slug={slug} workSpots={workSpots} />
}

export async function JourneysTabStream({ slug, destName }: { slug: string; destName: string }) {
  const { journeys } = await getCommunityData(slug)
  return <JourneysTab slug={slug} destName={destName} journeys={journeys} />
}

export async function StaysCommunityStream({ slug }: { slug: string }) {
  const { accommodations } = await getCommunityData(slug)
  return <StaysCommunitySection accommodations={accommodations} />
}

// Hero WiFi badge - the only DB-dependent piece of the otherwise static hero.
export async function HeroWifiBadge({ slug }: { slug: string }) {
  const { wifiSummary } = await getCommunityData(slug)
  const avgWifi = wifiSummary?.avg_download_mbps
  if (!avgWifi) return null
  return (
    <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
      {avgWifi} Mbps avg WiFi
    </span>
  )
}
