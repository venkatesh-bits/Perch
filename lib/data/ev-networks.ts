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
    name: 'Tata Power EZ Charge',
    url: 'https://www.tatapower.com/ev-charging/ev-charging-stations.aspx',
    blurb: 'One of India’s largest networks - CCS2 DC fast and AC points, mapped in the Tata Power EZ Charge app.',
  },
  {
    name: 'Ather Grid',
    url: 'https://www.atherenergy.com/ather-grid',
    blurb: 'Dense fast-charging grid that started with scooters and now adds car chargers.',
    twoWheeler: true,
  },
  {
    name: 'Statiq',
    url: 'https://www.statiq.in/',
    blurb: 'Wide pan-India network of AC and DC chargers; live map in the Statiq app.',
  },
  {
    name: 'ChargeZone',
    url: 'https://www.chargezone.com/',
    blurb: 'High-power DC fast-charging built around highway corridors.',
  },
  {
    name: 'Zeon Charging',
    url: 'https://zeoncharging.com/',
    blurb: 'Hotel, club and highway chargers - common across the southern hill stations.',
  },
  {
    name: 'ChargeMOD',
    url: 'https://chargemod.com/',
    blurb: 'Strong Kerala coverage, including the Munnar, Wayanad and Thekkady routes.',
  },
  {
    name: 'Ola Electric Hypercharger',
    url: 'https://www.olaelectric.com/hypercharger',
    blurb: 'Hypercharger network for Ola scooters, with points opening to other vehicles.',
    twoWheeler: true,
  },
  {
    name: 'Kazam',
    url: 'https://www.kazam.in/',
    blurb: 'One of the largest AC and two-wheeler networks; locator in the Kazam app.',
    twoWheeler: true,
  },
  {
    name: 'BPCL (Bharat Petroleum)',
    url: 'https://www.bharatpetroleum.in/',
    blurb: 'DC fast chargers at Bharat Petroleum fuel stations along the highways.',
  },
]

/** Government e-AMRIT national charging map (NITI Aayog). */
export const E_AMRIT_URL = 'https://e-amrit.niti.gov.in/charging-map'

/** A live Google Maps search for chargers near a named place. */
export function evSearchNear(place: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`EV charging near ${place}`)}`
}
