// EV charging as LINKS, not pins.
//
// A hand-placed map of chargers goes stale within weeks and can never be complete
// (Chennai alone has 130+ public points). So instead of highlighting our own
// points, we point drivers straight at the maps that are already live and kept
// current by the operators themselves: the all-network aggregator maps, the
// government map, and each charging network's own locator.

export interface EvNetwork {
  name: string
  url: string
  blurb: string
  /** Primarily a two-wheeler / scooter network. */
  twoWheeler?: boolean
}

// Maps that show chargers from EVERY network in one view - the best starting point.
export const EV_LIVE_MAPS: EvNetwork[] = [
  {
    name: 'PlugShare',
    url: 'https://www.plugshare.com/',
    blurb: 'Crowd-sourced map of chargers from every network, with photos, reviews and recent check-ins.',
  },
  {
    name: 'Google Maps',
    url: 'https://www.google.com/maps/search/?api=1&query=EV+charging+stations+near+me',
    blurb: 'Search "EV charging" anywhere on the route - most public chargers show up with ratings and hours.',
  },
  {
    name: 'e-AMRIT (Govt of India)',
    url: 'https://e-amrit.niti.gov.in/charging-map',
    blurb: 'NITI Aayog’s official national charging-station map, aggregated across operators.',
  },
]

// Individual networks and their own station locators / apps.
export const EV_NETWORKS: EvNetwork[] = [
  {
    name: 'Tata EV Route Planner',
    url: 'https://evrouteplanner.tatamotors.com/route-planner',
    blurb: 'Plan a route and it lays out charging stops along the way - handy for the long ghat drives.',
  },
  {
    name: 'Ather Grid',
    url: 'https://www.atherenergy.com/locate-ather-dealer',
    blurb: 'Dense fast-charging grid that started with scooters and now adds car chargers.',
    twoWheeler: true,
  },
  {
    name: 'Statiq',
    url: 'https://www.statiq.in/ev-charging-station',
    blurb: 'Wide pan-India network of AC and DC chargers; live map in the Statiq app.',
  },
  {
    name: 'ChargeZone',
    url: 'https://www.chargezone.co.in/charge-locator',
    blurb: 'High-power DC fast-charging built around highway corridors.',
  },
  {
    name: 'Zeon Charging',
    url: 'https://zeoncharging.com/charging_locations',
    blurb: 'Hotel, club and highway chargers - common across the southern hill stations.',
  },
  {
    name: 'ChargeMOD',
    url: 'https://chargemod.com/charging-stations',
    blurb: 'Strong Kerala coverage, including the Munnar, Wayanad and Thekkady routes.',
  },
  {
    name: 'Ola Electric Hypercharger',
    url: 'https://www.olaelectric.com/hypercharger-network#hypercharger-map',
    blurb: 'Hypercharger network for Ola scooters, with points opening to other vehicles.',
    twoWheeler: true,
  },
]

/** Government e-AMRIT national charging map (NITI Aayog). */
export const E_AMRIT_URL = 'https://e-amrit.niti.gov.in/charging-map'

/** A live Google Maps search for chargers near a named place. */
export function evSearchNear(place: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`EV charging near ${place}`)}`
}
