// Venkatesh's Kashmir Circuit - July 2026, as it actually happened.
// Four friends from Chennai on rented Himalayan 450s: Chandigarh to Manali,
// through the Atal Tunnel and over Shinku La into Zanskar (with one brutal
// night camped under Gonbo Rangjon), Pensi La to Kargil, Zoji La to Sonamarg,
// Razdan Pass into Gurez, Srinagar, a checkpoint turn-back short of Warwan,
// and a 2 am overnight run down to Pathankot. Nine riding days of a nine-day
// rental. Coordinates are anchor points for the map and live weather - the
// drawn route is illustrative, not turn-by-turn navigation.

export interface TripDay {
  day: number
  date: string           // display date
  from: string
  to: string
  via?: string           // passes / waypoints on the day's route
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
  dates: 'July 2026',
  days: 9,
  riders: 4,
  bike: 'Himalayan 450',
  distanceKm: 2100,      // rough odometer estimate for the loop
  passes: 4,             // Shinku La, Pensi La, Zoji La, Razdan La (crossed twice)
  maxAltM: 5091,
  maxAltName: 'Shinku La',
}

export const TRIP_DAYS: TripDay[] = [
  {
    day: 1, date: 'Sat', from: 'Chandigarh', to: 'Manali',
    via: 'Mandi', slug: 'manali', image: '/dest-images/manali.jpg',
    lat: 32.2396, lng: 77.1887, elevationM: 2050, highM: 2050, highName: 'Manali',
    story: 'Out of Chandigarh and up the Mandi road along the Beas, into Manali by evening. Mall Road after dark was packed shoulder to shoulder - and honestly great fun. Last easy comforts for a while.',
  },
  {
    day: 2, date: 'Sun', from: 'Manali', to: 'Gonbo Rangjon',
    via: 'Atal Tunnel · Sissu · Keylong · Shinku La',
    lat: 33.10, lng: 77.01, elevationM: 4100, highM: 5091, highName: 'Shinku La',
    story: 'Through the Atal Tunnel past Sissu and Keylong, up from Darcha to Shinku La at 5,091 m, then down to a tent camp under Gonbo Rangjon - the sacred rock mountain the camp crew call Gumbok Rangan. The mountain was worth every kilometre. The night was the worst of the trip: from 2,000 m to a 5,091 m pass and a 4,100 m camp in one day, and all four of us paid for it - out of oxygen, dehydrated, awake till dawn.',
    care: [
      'Do not repeat our altitude jump: Manali to a 4,100 m camp in one day invites AMS. Acclimatize, carry Diamox and oxygen, and drink water relentlessly.',
      'The camp has drinking water only - no hot water, nothing to wash with, no basic amenities. Go prepared, or push on to Padum.',
    ],
  },
  {
    day: 3, date: 'Mon', from: 'Gonbo Rangjon', to: 'Padum',
    via: 'Lungnak valley', slug: 'zanskar', image: '/dest-images/zanskar.jpg',
    lat: 33.4667, lng: 76.8833, elevationM: 3505, highM: 4150, highName: 'Gonbo Rangjon camp',
    story: 'Off the plateau and down the Lungnak valley into Zanskar proper. After the night before, Padum felt like a resort: a real little town with proper stays, hot food and actual beds. Nobody said much over dinner - we ate and slept.',
  },
  {
    day: 4, date: 'Tue', from: 'Padum', to: 'Kargil',
    via: 'Pensi La · Suru Valley',
    lat: 34.5539, lng: 76.1349, elevationM: 2676, highM: 4400, highName: 'Pensi La',
    story: 'West over Pensi La at 4,400 m with the Drang-Drung glacier curling below the road, then the long run down the Suru valley under the twin walls of Nun and Kun, into Kargil by evening.',
  },
  {
    day: 5, date: 'Wed', from: 'Kargil', to: 'Sonamarg',
    via: 'Drass · Zoji La', slug: 'sonamarg', image: '/dest-images/sonamarg.jpg',
    lat: 34.305, lng: 75.292, elevationM: 2800, highM: 3528, highName: 'Zoji La',
    story: 'Past Drass - the second-coldest inhabited town on earth - and over Zoji La into the green side of the ranges. Hotel Divine in Sonamarg gave us the view of the trip: the ice mountain filling the whole window.',
  },
  {
    day: 6, date: 'Thu', from: 'Sonamarg', to: 'Gurez Valley',
    via: 'Bandipora · Razdan Pass', slug: 'gurez-valley', image: '/dest-images/gurez-valley.jpg',
    lat: 34.63, lng: 74.83, elevationM: 2400, highM: 3300, highName: 'Razdan Pass',
    story: 'The best riding of the whole trip, full stop. Up through Bandipora, over Razdan Pass and down to the Kishanganga at Dawar, with Habba Khatoon’s pyramid peak standing over the valley. We took rooms above the Benz restaurant - a bit costly for what they are, but the location earns it.',
    care: ['LoC valley: government photo ID at the checkpoints, and data is close to nil beyond Razdan.'],
  },
  {
    day: 7, date: 'Fri', from: 'Gurez Valley', to: 'Srinagar',
    via: 'Razdan Pass', slug: 'srinagar', image: '/dest-images/srinagar.jpg',
    lat: 34.0837, lng: 74.7973, elevationM: 1585, highM: 3300, highName: 'Razdan Pass',
    story: 'Back over Razdan the way we came, then down the Bandipora road to Srinagar. A hotel near Dal Lake at ₹1,000 a head turned out to be the best-value stay of the loop - good rooms, the lake a short walk away.',
  },
  {
    day: 8, date: 'overnight run', from: 'Srinagar', to: 'Pathankot',
    via: 'Warwan approach (turned back)',
    lat: 32.2643, lng: 75.6421, elevationM: 330, highM: 2400, highName: 'Warwan approach',
    story: 'The plan was Warwan. We nearly made it - then an army checkpoint turned us around: the valley is closed to non-local tourists for now, and the soldiers were genuinely nice about it. At 4:45 pm we gave up on the mountains and pointed the bikes at the plains. On the broken Jammu highway a rear tyre went flat in the dark and the rain; a local shop guy fixed it at 9:30 pm - thrilling and horrible in equal parts. Pathankot at 2 am, hotel, out cold.',
    care: [
      'Warwan is closed to non-local tourists right now - check the current position before you build a plan around it.',
      'Carry a puncture kit, and stay off the Jammu highway stretch after dark.',
    ],
  },
  {
    day: 9, date: 'final day', from: 'Pathankot', to: 'Chandigarh',
    lat: 30.7333, lng: 76.7794, elevationM: 350, highM: 600, highName: 'Siwalik foothills',
    story: 'Through the Siwalik foothills and into Chandigarh by 6:30 pm. We handed the bikes back a day early - the unused day’s rent stayed with the shop. One more night in Sector 42, then the evening flight home to Chennai.',
  },
]

// Anchor + pass points for the illustrative route line, in riding order.
export const ROUTE_LINE: [number, number][] = [
  [76.7794, 30.7333], // Chandigarh
  [76.9300, 31.7100], // Mandi
  [77.1887, 32.2396], // Manali
  [77.1279, 32.4763], // Sissu
  [77.0300, 32.5700], // Keylong
  [77.0300, 32.8300], // Shinku La
  [77.0100, 33.1000], // Gonbo Rangjon
  [76.8833, 33.4667], // Padum
  [76.3000, 33.7500], // Pensi La
  [76.1349, 34.5539], // Kargil
  [75.7500, 34.4300], // Drass
  [75.4700, 34.2800], // Zoji La
  [75.2920, 34.3050], // Sonamarg
  [74.6500, 34.4200], // Bandipora
  [74.8300, 34.6300], // Gurez (Dawar)
  [74.6500, 34.4200], // Bandipora again, back over Razdan
  [74.7973, 34.0837], // Srinagar
  [75.3000, 33.5900], // Warwan approach (turned back)
  [74.8700, 32.7300], // Jammu
  [75.6421, 32.2643], // Pathankot
  [76.7794, 30.7333], // Chandigarh
]

/** Numbered stops for map markers + the fly-through (one per trip day). */
export const TRIP_STOPS = TRIP_DAYS.map((d) => ({
  day: d.day,
  name: d.to,
  lat: d.lat,
  lng: d.lng,
}))
