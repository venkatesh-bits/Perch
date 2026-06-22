'use client'

import dynamic from 'next/dynamic'

// Defer the MapLibre bundle (~200KB) until this client wrapper renders.
const DestinationPinMap = dynamic(
  () => import('./route-map').then((mod) => mod.DestinationPinMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-[var(--paper-deep)]" />,
  },
)

interface Props {
  lat: number
  lng: number
  label?: string
}

export function DestinationPinMapClient({ lat, lng, label }: Props) {
  return (
    <div className="h-[240px] overflow-hidden rounded-2xl border border-white/15">
      <DestinationPinMap lat={lat} lng={lng} label={label} />
    </div>
  )
}
