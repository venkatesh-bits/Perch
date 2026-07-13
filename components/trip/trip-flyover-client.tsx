'use client'

import dynamic from 'next/dynamic'

// Defer the MapLibre bundle until this client wrapper renders.
const TripFlyover = dynamic(
  () => import('./trip-flyover').then((mod) => mod.TripFlyover),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-[var(--paper-deep)]" />,
  },
)

export function TripFlyoverClient() {
  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-[var(--line)] sm:h-[480px]">
      <TripFlyover />
    </div>
  )
}
