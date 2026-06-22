'use client'

import { DestinationPinMap } from './route-map'

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
