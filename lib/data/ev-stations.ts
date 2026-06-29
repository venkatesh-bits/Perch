// EV charging districts for the /charging page.
//
// We deliberately do NOT keep our own list of individual chargers - a
// hand-maintained list goes stale within a week. Instead we surface a directory
// of districts, each linking out to live, always-current sources (Google Maps
// search + the government e-AMRIT map). See lib/data/ev-networks.ts for the
// network/operator map links.

export interface DistrictEntry {
  district: string
  state: string
  blurb?: string
}

// Every South-Indian district we surface - each gets live "see all" links.
// Order = rough travel relevance.
export const DISTRICT_DIRECTORY: DistrictEntry[] = [
  // Tamil Nadu
  { district: 'Chennai',          state: 'Tamil Nadu',     blurb: 'Biggest EV hub in the south - 130+ public points.' },
  { district: 'Coimbatore',       state: 'Tamil Nadu',     blurb: 'Last big charge before the Nilgiris ghats.' },
  { district: 'The Nilgiris',     state: 'Tamil Nadu',     blurb: 'Ooty, Coonoor, Kotagiri - mostly AC/hotel chargers.' },
  { district: 'Salem',            state: 'Tamil Nadu',     blurb: 'NH44 corridor + gateway to Yercaud.' },
  { district: 'Krishnagiri',      state: 'Tamil Nadu' },
  { district: 'Madurai',          state: 'Tamil Nadu' },
  { district: 'Dindigul',         state: 'Tamil Nadu',     blurb: 'Charge here before the Kodaikanal ghat.' },
  { district: 'Tiruchirappalli',  state: 'Tamil Nadu' },
  { district: 'Vellore',          state: 'Tamil Nadu' },
  { district: 'Tirunelveli',      state: 'Tamil Nadu' },
  // Puducherry
  { district: 'Puducherry',       state: 'Puducherry',     blurb: 'Compact union territory - chargers along ECR & town.' },
  // Karnataka
  { district: 'Bengaluru Urban',  state: 'Karnataka',      blurb: 'Dense network - start point for Coorg/Chikmagalur.' },
  { district: 'Mysuru',           state: 'Karnataka',      blurb: 'Split point for Coorg & Wayanad.' },
  { district: 'Kodagu (Coorg)',   state: 'Karnataka' },
  { district: 'Chikkamagaluru',   state: 'Karnataka' },
  { district: 'Hassan',           state: 'Karnataka' },
  { district: 'Mandya',           state: 'Karnataka' },
  { district: 'Ramanagara',       state: 'Karnataka' },
  { district: 'Dakshina Kannada', state: 'Karnataka',      blurb: 'Mangaluru coast.' },
  // Kerala
  { district: 'Ernakulam',        state: 'Kerala',         blurb: 'Kochi - base for the Munnar climb.' },
  { district: 'Idukki',           state: 'Kerala',         blurb: 'Munnar & Thekkady - chargeMOD/KSEB coverage.' },
  { district: 'Wayanad',          state: 'Kerala' },
  { district: 'Thiruvananthapuram', state: 'Kerala' },
  // Andhra Pradesh
  { district: 'Visakhapatnam',    state: 'Andhra Pradesh', blurb: 'Base for the Araku Valley drive.' },
  // Telangana
  { district: 'Hyderabad',        state: 'Telangana',      blurb: 'Base for Ananthagiri Hills.' },
]

/** Google Maps live search for "EV charging" within a district. Opens in a new tab. */
export function districtGoogleMapsUrl(d: DistrictEntry): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`EV charging stations in ${d.district}, ${d.state}`)}`
}
