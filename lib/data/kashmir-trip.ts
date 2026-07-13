// Venkatesh's Kashmir Circuit - 4 to 14 July 2026.
// A personal trip log rendered at /kashmir: eleven driving days from Chandigarh
// over Sach Pass into Kishtwar and Warwan, across the Budgam meadows to the
// LoC valleys (Bangus, Keran, Gurez), then east through Kargil into Zanskar and
// home over Shinku La. Coordinates are anchor points for the map and live
// weather - the drawn route is illustrative, not turn-by-turn navigation.

export interface TripDay {
  day: number
  date: string           // display date
  from: string
  to: string
  via?: string           // passes / waypoints listed on the plan
  slug?: string          // catalogue destination to link to, when one exists
  image?: string         // self-hosted photo, when one exists
  lat: number            // anchor = that night's halt
  lng: number
  elevationM: number     // halt elevation (approx)
  highM: number          // highest point crossed that day (approx)
  highName?: string
  story: string
  care?: string[]
}

export const TRIP_META = {
  title: 'The Kashmir Circuit',
  dates: '4 - 14 July 2026',
  days: 11,
  distanceKm: 2200,      // rough odometer estimate for the loop
  passes: 7,
  maxAltM: 5091,
  maxAltName: 'Shinku La',
}

export const TRIP_DAYS: TripDay[] = [
  {
    day: 1, date: 'Sat 4 Jul', from: 'Chandigarh', to: 'Manali / Sissu',
    via: 'Atal Tunnel', slug: 'manali', image: '/dest-images/manali.jpg',
    lat: 32.4763, lng: 77.1279, elevationM: 3130, highM: 3130, highName: 'Sissu',
    story: 'The long climb out of the plains: Beas valley traffic, then through the Atal Tunnel and suddenly into the drier light of Lahaul. First night at altitude.',
    care: ['Sissu is already 3,100 m - an easy first evening helps the days ahead.'],
  },
  {
    day: 2, date: 'Sun 5 Jul', from: 'Sissu', to: 'Kishtwar',
    via: 'Sach Pass · Killar · Sural Bhatori',
    lat: 33.3130, lng: 75.7665, elevationM: 1640, highM: 4420, highName: 'Sach Pass',
    story: 'The big one on the sheet: Sach Pass snow walls, the Pangi valley and the Sural Bhatori side village, then the infamous Killar-Kishtwar cliff road cut into the Chenab gorge.',
    care: [
      'The Killar-Kishtwar stretch is a daylight-only road - no railings, sheer drops.',
      'Fuel is scarce in Pangi; top up whenever a pump appears.',
    ],
  },
  {
    day: 3, date: 'Mon 6 Jul', from: 'Kishtwar', to: 'Warwan Valley',
    lat: 33.56, lng: 75.45, elevationM: 2400, highM: 2400, highName: 'Inshan',
    story: 'Up the Marwah river into Warwan - one of the most remote inhabited valleys in Kashmir, still untouched by the tourist circuit. Wood-and-stone villages, glacier water, silence.',
    care: ['No fuel, no ATM and effectively no network beyond Inshan - go in self-sufficient.'],
  },
  {
    day: 4, date: 'Tue 7 Jul', from: 'Warwan Valley', to: 'Yusmarg · Tosamaidan · Doodhpathri',
    via: 'Margan Top', slug: 'doodhpathri', image: '/dest-images/doodhpathri.jpg',
    lat: 33.8267, lng: 74.8676, elevationM: 2730, highM: 3880, highName: 'Margan Top',
    story: 'Over Margan Top and down into Budgam - three meadows in a day. Doodhpathri milk-white streams, Tosamaidan wide open, Yusmarg under the Pir Panjal.',
    care: ['Only postpaid SIMs work in J&K - true for the rest of the loop too.'],
  },
  {
    day: 5, date: 'Wed 8 Jul', from: 'Budgam meadows', to: 'Bangus Valley',
    lat: 34.45, lng: 74.05, elevationM: 3050, highM: 3050, highName: 'Bangus meadow',
    story: 'North into Kupwara and up to Bangus - a huge hidden bowl of grass behind the ranges, still almost unvisited.',
    care: ['Army checkpoints on the approach - carry government photo ID.', 'No facilities at the meadow.'],
  },
  {
    day: 6, date: 'Thu 9 Jul', from: 'Bangus Valley', to: 'Keran Valley',
    via: 'Sadhna Pass',
    lat: 34.65, lng: 73.94, elevationM: 1850, highM: 3000, highName: 'Sadhna Pass',
    story: 'Over Sadhna Pass and down to the Kishanganga. Keran sits right on the Line of Control - the village across the river is on the other side.',
    care: [
      'LoC zone: ID checks, and photography is restricted near army positions.',
      'Network is close to nil - tell someone your plan before this stretch.',
    ],
  },
  {
    day: 7, date: 'Fri 10 Jul', from: 'Keran Valley', to: 'Gurez / Tulail Valley',
    via: 'Razdan Pass · Lolab (optional)', slug: 'gurez-valley', image: '/dest-images/gurez-valley.jpg',
    lat: 34.63, lng: 74.83, elevationM: 2400, highM: 3300, highName: 'Razdan Pass',
    story: 'Across Kupwara and over Razdan Pass to Dawar, with Habba Khatoon’s pyramid peak above the Kishanganga, then deeper into Tulail.',
    care: ['Another LoC valley - same drill: ID, checkpoints, almost no data.'],
  },
  {
    day: 8, date: 'Sat 11 Jul', from: 'Gurez / Tulail', to: 'Kargil',
    via: 'Zoji La · Drass',
    lat: 34.5539, lng: 76.1349, elevationM: 2676, highM: 3528, highName: 'Zoji La',
    story: 'The long eastward haul: back out of Gurez, over Zoji La and past Drass - the second-coldest inhabited town on earth - into Kargil.',
    care: ['Zoji La is one-way in stretches with convoy timings - check the gate times.'],
  },
  {
    day: 9, date: 'Sun 12 Jul', from: 'Kargil', to: 'Padum (Zanskar)',
    via: 'Suru Valley · Pensi La', slug: 'zanskar', image: '/dest-images/zanskar.jpg',
    lat: 33.4667, lng: 76.8833, elevationM: 3505, highM: 4400, highName: 'Pensi La',
    story: 'The Suru valley under the twin walls of Nun and Kun, then Pensi La with the Drang-Drung glacier curling below - the doorway into Zanskar.',
    care: ['Fuel up in Kargil - the next reliable pump is Padum itself.'],
  },
  {
    day: 10, date: 'Mon 13 Jul', from: 'Padum', to: 'Manali / Sissu',
    via: 'Shinku La',
    lat: 32.4763, lng: 77.1279, elevationM: 3130, highM: 5091, highName: 'Shinku La',
    story: 'The high point of the whole circuit, literally: out of Zanskar over Shinku La at 5,091 m, prayer flags in the wind, then down the Darcha road into Lahaul.',
    care: ['5,091 m: start early, keep the pass stop short, and descend if anyone feels AMS.'],
  },
  {
    day: 11, date: 'Tue 14 Jul', from: 'Manali / Sissu', to: 'Chandigarh',
    lat: 30.7333, lng: 76.7794, elevationM: 350, highM: 3130, highName: 'Sissu',
    story: 'Back through the tunnel and down the Beas - 4,700 vertical metres below yesterday’s pass. The plains feel loud after Warwan.',
  },
]

// Anchor + pass points for the illustrative route line, in driving order.
export const ROUTE_LINE: [number, number][] = [
  [76.7794, 30.7333], // Chandigarh
  [77.1887, 32.2396], // Manali
  [77.1279, 32.4763], // Sissu
  [76.6800, 32.7200], // Udaipur (Pattan valley)
  [76.3990, 33.0860], // Killar / Sach Pass side
  [75.7665, 33.3130], // Kishtwar
  [75.4500, 33.5600], // Warwan (Inshan)
  [75.3300, 33.6800], // Margan Top
  [74.8676, 33.8267], // Doodhpathri
  [74.6670, 33.8330], // Yusmarg
  [74.0500, 34.4500], // Bangus
  [73.9400, 34.6500], // Keran
  [74.8300, 34.6300], // Gurez (Dawar)
  [75.4700, 34.2800], // Zoji La
  [76.1349, 34.5539], // Kargil
  [76.3000, 33.7500], // Pensi La
  [76.8833, 33.4667], // Padum
  [77.0300, 32.8300], // Shinku La
  [77.1279, 32.4763], // Sissu
  [77.1887, 32.2396], // Manali
  [76.7794, 30.7333], // Chandigarh
]

/** Numbered stops for map markers + the fly-through (one per trip day). */
export const TRIP_STOPS = TRIP_DAYS.map((d) => ({
  day: d.day,
  name: d.to,
  lat: d.lat,
  lng: d.lng,
}))
