// Curated place dataset for client-side search. No geocoding API, no per-search
// billing. Each place's lat/lng is fixed at data-entry time, so visitor search
// is just instant client-side filtering over this list. Scales infinitely at $0.
// Destinations are derived from the canonical catalogue in lib/data/destinations.ts
// so there is a single source of truth.

import { DESTINATIONS } from './destinations'

export interface Place {
  name: string
  state: string
  lat: number
  lng: number
  type: 'origin' | 'destination'
  slug?: string // destinations link to /destinations/[slug]
}

// Major South Indian cities and towns travellers set off from.
// Covers all significant district headquarters + major towns across TN, KL, KA, AP, TG, PY.
export const ORIGIN_CITIES: Place[] = [
  // ── Tamil Nadu ────────────────────────────────────────────────────────────────
  { name: 'Chennai',            state: 'Tamil Nadu',     lat: 13.0827, lng: 80.2707, type: 'origin' },
  { name: 'Coimbatore',         state: 'Tamil Nadu',     lat: 11.0168, lng: 76.9558, type: 'origin' },
  { name: 'Madurai',            state: 'Tamil Nadu',     lat:  9.9252, lng: 78.1198, type: 'origin' },
  { name: 'Salem',              state: 'Tamil Nadu',     lat: 11.6643, lng: 78.1460, type: 'origin' },
  { name: 'Tiruchirappalli',    state: 'Tamil Nadu',     lat: 10.7905, lng: 78.7047, type: 'origin' },
  { name: 'Tirunelveli',        state: 'Tamil Nadu',     lat:  8.7139, lng: 77.7567, type: 'origin' },
  { name: 'Vellore',            state: 'Tamil Nadu',     lat: 12.9165, lng: 79.1325, type: 'origin' },
  { name: 'Erode',              state: 'Tamil Nadu',     lat: 11.3410, lng: 77.7172, type: 'origin' },
  { name: 'Tiruppur',           state: 'Tamil Nadu',     lat: 11.1085, lng: 77.3411, type: 'origin' },
  { name: 'Thanjavur',          state: 'Tamil Nadu',     lat: 10.7867, lng: 79.1378, type: 'origin' },
  { name: 'Thoothukudi',        state: 'Tamil Nadu',     lat:  8.7642, lng: 78.1348, type: 'origin' },
  { name: 'Dindigul',           state: 'Tamil Nadu',     lat: 10.3624, lng: 77.9695, type: 'origin' },
  { name: 'Kumbakonam',         state: 'Tamil Nadu',     lat: 10.9602, lng: 79.3845, type: 'origin' },
  { name: 'Kancheepuram',       state: 'Tamil Nadu',     lat: 12.8342, lng: 79.7036, type: 'origin' },
  { name: 'Nagercoil',          state: 'Tamil Nadu',     lat:  8.1833, lng: 77.4119, type: 'origin' },
  { name: 'Namakkal',           state: 'Tamil Nadu',     lat: 11.2190, lng: 78.1674, type: 'origin' },
  { name: 'Krishnagiri',        state: 'Tamil Nadu',     lat: 12.5185, lng: 78.2137, type: 'origin' },
  { name: 'Dharmapuri',         state: 'Tamil Nadu',     lat: 12.1269, lng: 78.1582, type: 'origin' },
  { name: 'Villupuram',         state: 'Tamil Nadu',     lat: 11.9401, lng: 79.4928, type: 'origin' },
  { name: 'Cuddalore',          state: 'Tamil Nadu',     lat: 11.7480, lng: 79.7714, type: 'origin' },
  { name: 'Karur',              state: 'Tamil Nadu',     lat: 10.9601, lng: 78.0766, type: 'origin' },
  { name: 'Virudhunagar',       state: 'Tamil Nadu',     lat:  9.5814, lng: 77.9620, type: 'origin' },
  { name: 'Ramanathapuram',     state: 'Tamil Nadu',     lat:  9.3639, lng: 78.8395, type: 'origin' },
  { name: 'Tiruvannamalai',     state: 'Tamil Nadu',     lat: 12.2253, lng: 79.0747, type: 'origin' },
  { name: 'Hosur',              state: 'Tamil Nadu',     lat: 12.7409, lng: 77.8253, type: 'origin' },
  { name: 'Pollachi',           state: 'Tamil Nadu',     lat: 10.6590, lng: 77.0073, type: 'origin' },
  { name: 'Sivakasi',           state: 'Tamil Nadu',     lat:  9.4528, lng: 77.7981, type: 'origin' },
  { name: 'Pudukkottai',        state: 'Tamil Nadu',     lat: 10.3797, lng: 78.8201, type: 'origin' },
  { name: 'Nagapattinam',       state: 'Tamil Nadu',     lat: 10.7667, lng: 79.8440, type: 'origin' },
  { name: 'Sivaganga',          state: 'Tamil Nadu',     lat:  9.8479, lng: 78.4747, type: 'origin' },
  { name: 'Chidambaram',        state: 'Tamil Nadu',     lat: 11.3993, lng: 79.6936, type: 'origin' },
  { name: 'Mayiladuthurai',     state: 'Tamil Nadu',     lat: 11.1027, lng: 79.6532, type: 'origin' },
  { name: 'Rajapalayam',        state: 'Tamil Nadu',     lat:  9.4504, lng: 77.5559, type: 'origin' },
  { name: 'Karaikudi',          state: 'Tamil Nadu',     lat: 10.0754, lng: 78.7724, type: 'origin' },
  { name: 'Ariyalur',           state: 'Tamil Nadu',     lat: 11.1427, lng: 79.0783, type: 'origin' },
  { name: 'Tenkasi',            state: 'Tamil Nadu',     lat:  8.9606, lng: 77.3151, type: 'origin' },
  { name: 'Bodinayakanur',      state: 'Tamil Nadu',     lat: 10.0126, lng: 77.3524, type: 'origin' },
  { name: 'Vasudevanallur',     state: 'Tamil Nadu',     lat:  9.0726, lng: 77.3154, type: 'origin' },

  // ── Kerala ────────────────────────────────────────────────────────────────────
  { name: 'Kochi',              state: 'Kerala',         lat:  9.9312, lng: 76.2673, type: 'origin' },
  { name: 'Thiruvananthapuram', state: 'Kerala',         lat:  8.5241, lng: 76.9366, type: 'origin' },
  { name: 'Kozhikode',          state: 'Kerala',         lat: 11.2588, lng: 75.7804, type: 'origin' },
  { name: 'Thrissur',           state: 'Kerala',         lat: 10.5276, lng: 76.2144, type: 'origin' },
  { name: 'Kollam',             state: 'Kerala',         lat:  8.8932, lng: 76.6141, type: 'origin' },
  { name: 'Kannur',             state: 'Kerala',         lat: 11.8745, lng: 75.3704, type: 'origin' },
  { name: 'Palakkad',           state: 'Kerala',         lat: 10.7867, lng: 76.6548, type: 'origin' },
  { name: 'Malappuram',         state: 'Kerala',         lat: 11.0510, lng: 76.0711, type: 'origin' },
  { name: 'Alappuzha',          state: 'Kerala',         lat:  9.4981, lng: 76.3388, type: 'origin' },
  { name: 'Kottayam',           state: 'Kerala',         lat:  9.5916, lng: 76.5222, type: 'origin' },
  { name: 'Pathanamthitta',     state: 'Kerala',         lat:  9.2648, lng: 76.7870, type: 'origin' },
  { name: 'Kasaragod',          state: 'Kerala',         lat: 12.4996, lng: 74.9869, type: 'origin' },
  { name: 'Thalassery',         state: 'Kerala',         lat: 11.7516, lng: 75.4927, type: 'origin' },
  { name: 'Changanacherry',     state: 'Kerala',         lat:  9.4376, lng: 76.5404, type: 'origin' },
  { name: 'Thodupuzha',         state: 'Kerala',         lat:  9.8957, lng: 76.7179, type: 'origin' },
  { name: 'Manjeri',            state: 'Kerala',         lat: 11.1190, lng: 76.1189, type: 'origin' },
  { name: 'Chalakudy',          state: 'Kerala',         lat: 10.3030, lng: 76.3310, type: 'origin' },
  { name: 'Perinthalmanna',     state: 'Kerala',         lat: 10.9792, lng: 76.2281, type: 'origin' },

  // ── Karnataka ─────────────────────────────────────────────────────────────────
  { name: 'Bengaluru',          state: 'Karnataka',      lat: 12.9716, lng: 77.5946, type: 'origin' },
  { name: 'Mysuru',             state: 'Karnataka',      lat: 12.2958, lng: 76.6394, type: 'origin' },
  { name: 'Mangaluru',          state: 'Karnataka',      lat: 12.9141, lng: 74.8560, type: 'origin' },
  { name: 'Hubli',              state: 'Karnataka',      lat: 15.3647, lng: 75.1240, type: 'origin' },
  { name: 'Dharwad',            state: 'Karnataka',      lat: 15.4589, lng: 75.0078, type: 'origin' },
  { name: 'Belagavi',           state: 'Karnataka',      lat: 15.8497, lng: 74.4977, type: 'origin' },
  { name: 'Davangere',          state: 'Karnataka',      lat: 14.4644, lng: 75.9218, type: 'origin' },
  { name: 'Shivamogga',         state: 'Karnataka',      lat: 13.9299, lng: 75.5681, type: 'origin' },
  { name: 'Tumakuru',           state: 'Karnataka',      lat: 13.3379, lng: 77.1173, type: 'origin' },
  { name: 'Hassan',             state: 'Karnataka',      lat: 13.0068, lng: 76.0996, type: 'origin' },
  { name: 'Udupi',              state: 'Karnataka',      lat: 13.3409, lng: 74.7421, type: 'origin' },
  { name: 'Vijayapura',         state: 'Karnataka',      lat: 16.8302, lng: 75.7100, type: 'origin' },
  { name: 'Kalaburagi',         state: 'Karnataka',      lat: 17.3297, lng: 76.8200, type: 'origin' },
  { name: 'Ballari',            state: 'Karnataka',      lat: 15.1394, lng: 76.9214, type: 'origin' },
  { name: 'Chitradurga',        state: 'Karnataka',      lat: 14.2251, lng: 76.3975, type: 'origin' },
  { name: 'Mandya',             state: 'Karnataka',      lat: 12.5218, lng: 76.8951, type: 'origin' },
  { name: 'Raichur',            state: 'Karnataka',      lat: 16.2120, lng: 77.3439, type: 'origin' },
  { name: 'Chikkamagaluru',     state: 'Karnataka',      lat: 13.3153, lng: 75.7762, type: 'origin' },
  { name: 'Bagalkot',           state: 'Karnataka',      lat: 16.1800, lng: 75.6960, type: 'origin' },
  { name: 'Bidar',              state: 'Karnataka',      lat: 17.9104, lng: 77.5199, type: 'origin' },
  { name: 'Gadag',              state: 'Karnataka',      lat: 15.4166, lng: 75.6241, type: 'origin' },
  { name: 'Hosapete',           state: 'Karnataka',      lat: 15.2689, lng: 76.3909, type: 'origin' },
  { name: 'Chamarajanagar',     state: 'Karnataka',      lat: 11.9238, lng: 76.9442, type: 'origin' },
  { name: 'Chikkaballapur',     state: 'Karnataka',      lat: 13.4344, lng: 77.7274, type: 'origin' },
  { name: 'Ramanagara',         state: 'Karnataka',      lat: 12.7157, lng: 77.2811, type: 'origin' },
  { name: 'Kolar',              state: 'Karnataka',      lat: 13.1366, lng: 78.1302, type: 'origin' },

  // ── Andhra Pradesh ────────────────────────────────────────────────────────────
  { name: 'Visakhapatnam',      state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, type: 'origin' },
  { name: 'Vijayawada',         state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, type: 'origin' },
  { name: 'Tirupati',           state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192, type: 'origin' },
  { name: 'Guntur',             state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, type: 'origin' },
  { name: 'Nellore',            state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865, type: 'origin' },
  { name: 'Kurnool',            state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373, type: 'origin' },
  { name: 'Rajahmundry',        state: 'Andhra Pradesh', lat: 17.0005, lng: 81.8040, type: 'origin' },
  { name: 'Kakinada',           state: 'Andhra Pradesh', lat: 16.9891, lng: 82.2475, type: 'origin' },
  { name: 'Anantapur',          state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006, type: 'origin' },
  { name: 'Chittoor',           state: 'Andhra Pradesh', lat: 13.2172, lng: 79.1003, type: 'origin' },
  { name: 'Eluru',              state: 'Andhra Pradesh', lat: 16.7107, lng: 81.0952, type: 'origin' },
  { name: 'Ongole',             state: 'Andhra Pradesh', lat: 15.5057, lng: 80.0499, type: 'origin' },
  { name: 'Kadapa',             state: 'Andhra Pradesh', lat: 14.4674, lng: 78.8241, type: 'origin' },
  { name: 'Srikakulam',         state: 'Andhra Pradesh', lat: 18.2968, lng: 83.8989, type: 'origin' },
  { name: 'Vizianagaram',       state: 'Andhra Pradesh', lat: 18.1066, lng: 83.3956, type: 'origin' },
  { name: 'Nandyal',            state: 'Andhra Pradesh', lat: 15.4786, lng: 78.4839, type: 'origin' },
  { name: 'Bhimavaram',         state: 'Andhra Pradesh', lat: 16.5444, lng: 81.5228, type: 'origin' },

  // ── Telangana ─────────────────────────────────────────────────────────────────
  { name: 'Hyderabad',          state: 'Telangana',      lat: 17.3850, lng: 78.4867, type: 'origin' },
  { name: 'Warangal',           state: 'Telangana',      lat: 17.9689, lng: 79.5941, type: 'origin' },
  { name: 'Nizamabad',          state: 'Telangana',      lat: 18.6725, lng: 78.0941, type: 'origin' },
  { name: 'Karimnagar',         state: 'Telangana',      lat: 18.4386, lng: 79.1288, type: 'origin' },
  { name: 'Khammam',            state: 'Telangana',      lat: 17.2473, lng: 80.1514, type: 'origin' },
  { name: 'Mahbubnagar',        state: 'Telangana',      lat: 16.7488, lng: 78.0042, type: 'origin' },
  { name: 'Nalgonda',           state: 'Telangana',      lat: 17.0575, lng: 79.2668, type: 'origin' },
  { name: 'Sangareddy',         state: 'Telangana',      lat: 17.6260, lng: 78.0850, type: 'origin' },
  { name: 'Siddipet',           state: 'Telangana',      lat: 18.1018, lng: 78.8520, type: 'origin' },
  { name: 'Adilabad',           state: 'Telangana',      lat: 19.6640, lng: 78.5320, type: 'origin' },
  { name: 'Mancherial',         state: 'Telangana',      lat: 18.8714, lng: 79.4605, type: 'origin' },
  { name: 'Suryapet',           state: 'Telangana',      lat: 17.1412, lng: 79.6289, type: 'origin' },

  // ── Puducherry ────────────────────────────────────────────────────────────────
  { name: 'Puducherry',         state: 'Puducherry',     lat: 11.9416, lng: 79.8083, type: 'origin' },
  { name: 'Karaikal',           state: 'Puducherry',     lat: 10.9254, lng: 79.8380, type: 'origin' },
]

// Destinations - derived from the canonical hill-station catalogue.
// The DB stays the source of truth for page content; this list powers instant search only.
export const DESTINATION_PLACES: Place[] = DESTINATIONS.map((d) => ({
  name: d.name,
  state: d.state,
  lat: d.lat,
  lng: d.lng,
  type: 'destination' as const,
  slug: d.slug,
}))

export const ALL_PLACES: Place[] = [...ORIGIN_CITIES, ...DESTINATION_PLACES]

/** Case-insensitive client-side filter - instant, no network round-trip. */
export function searchPlaces(query: string, places: Place[], limit = 8): Place[] {
  const q = query.trim().toLowerCase()
  if (!q) return places.slice(0, limit)
  return places
    .filter((p) => p.name.toLowerCase().includes(q) || p.state.toLowerCase().includes(q))
    .slice(0, limit)
}

/** Haversine great-circle distance in km - for an "as the crow flies" estimate
 *  when we have no community-reported road distance yet. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}

export const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
