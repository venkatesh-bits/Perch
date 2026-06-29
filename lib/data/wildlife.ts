// Curated wildlife / national-park data for destinations famous for animal
// sightseeing, safaris or protected forests. Kept separate from the destinations
// catalogue so the source-of-truth stays lean; the Overview tab renders a
// "Wildlife & nature" card whenever wildlifeFor(slug) returns an entry.
//
// Sourced from forest-department / national-park public info. Species lists name
// the headline animals a visitor realistically associates with the park.

export interface Wildlife {
  /** Protected area or animal attraction the place is known for. */
  park: string
  /** One-line description of the wildlife experience. */
  note: string
  /** Headline species visitors come to see. */
  species: string[]
}

export const WILDLIFE: Record<string, Wildlife> = {
  valparai: {
    park: 'Anamalai Tiger Reserve (Valparai plateau)',
    note: 'Rainforest plateau famous for lion-tailed macaque troops and elephants crossing the tea estates.',
    species: ['Lion-tailed macaque', 'Asian elephant', 'Nilgiri tahr', 'Great hornbill'],
  },
  megamalai: {
    park: 'Megamalai Wildlife Sanctuary',
    note: 'Cloud-forest and grassland sanctuary in the High Wavy Mountains, rich in large mammals.',
    species: ['Elephant', 'Gaur', 'Nilgiri tahr', 'Grizzled giant squirrel'],
  },
  topslip: {
    park: 'Anamalai Tiger Reserve (Topslip)',
    note: 'Trekking and safari base inside the Anamalai Tiger Reserve, with regular elephant herds.',
    species: ['Tiger', 'Asian elephant', 'Gaur', 'Lion-tailed macaque'],
  },
  mudumalai: {
    park: 'Mudumalai Tiger Reserve',
    note: 'Jeep safaris through one of South India’s premier tiger reserves at the tri-state junction.',
    species: ['Tiger', 'Asian elephant', 'Gaur', 'Spotted deer', 'Leopard'],
  },
  munnar: {
    park: 'Eravikulam National Park',
    note: 'Shola-grasslands above Munnar protecting the Nilgiri tahr, below Anamudi (2,695 m), the highest peak in the south.',
    species: ['Nilgiri tahr', 'Nilgiri langur', 'Atlas moth'],
  },
  eravikulam: {
    park: 'Eravikulam National Park',
    note: 'Rolling shola-grasslands holding the world’s largest population of endangered Nilgiri tahr.',
    species: ['Nilgiri tahr', 'Nilgiri langur', 'Neelakurinji (blooms once in 12 years)'],
  },
  thekkady: {
    park: 'Periyar Tiger Reserve',
    note: 'Boat safaris on Periyar Lake to spot elephants and gaur grazing at the water’s edge.',
    species: ['Asian elephant', 'Tiger', 'Gaur', 'Sambar deer'],
  },
  gavi: {
    park: 'Periyar Tiger Reserve (Gavi eco-tourism)',
    note: 'Guided eco-treks and boating in the Periyar forest belt, excellent for birding.',
    species: ['Lion-tailed macaque', 'Great hornbill', 'Asian elephant', 'Leopard'],
  },
  'silent-valley': {
    park: 'Silent Valley National Park',
    note: 'One of India’s last undisturbed tropical rainforests, along the Kunthipuzha river.',
    species: ['Lion-tailed macaque', 'Nilgiri langur', 'Great hornbill', 'Malabar giant squirrel'],
  },
  wayanad: {
    park: 'Wayanad Wildlife Sanctuary (Muthanga & Tholpetty)',
    note: 'Part of the Nilgiri Biosphere; safaris at Muthanga and Tholpetty among elephant herds.',
    species: ['Asian elephant', 'Tiger', 'Gaur', 'Spotted deer'],
  },
  'br-hills': {
    park: 'BRT Tiger Reserve (Biligiri Rangaswamy Temple)',
    note: 'Safari through forests that bridge the Western and Eastern Ghats.',
    species: ['Tiger', 'Asian elephant', 'Gaur', 'Leopard'],
  },
  kabini: {
    park: 'Nagarhole National Park (Kabini)',
    note: 'Boat and jeep safaris on the Kabini backwaters, famous for black-panther (melanistic leopard) sightings.',
    species: ['Black panther', 'Asian elephant', 'Tiger', 'Gaur'],
  },
  kudremukh: {
    park: 'Kudremukh National Park',
    note: 'Shola-grassland national park and a Western Ghats biodiversity hotspot.',
    species: ['Lion-tailed macaque', 'Tiger', 'Sloth bear', 'Malabar giant squirrel'],
  },
  nallamala: {
    park: 'Nagarjunasagar-Srisailam Tiger Reserve',
    note: 'India’s largest tiger reserve, spread along the Krishna gorge in the Nallamala forest.',
    species: ['Tiger', 'Leopard', 'Sloth bear', 'Chital'],
  },
  farahabad: {
    park: 'Amrabad Tiger Reserve',
    note: 'A viewpoint deep inside the Amrabad Tiger Reserve, overlooking the Nallamala forest.',
    species: ['Tiger', 'Leopard', 'Sloth bear', 'Chital'],
  },
  maredumilli: {
    park: 'Maredumilli forests (Eastern Ghats)',
    note: 'Community eco-tourism in dense Eastern Ghats rainforest, with waterfalls and birding.',
    species: ['Leopard', 'Sloth bear', 'Hornbill', 'Sambar deer'],
  },
  coorg: {
    park: 'Dubare Elephant Camp & Nagarhole (nearby)',
    note: 'Dubare elephant camp on the Kaveri, with safaris at nearby Nagarhole National Park.',
    species: ['Asian elephant', 'Leopard', 'Spotted deer'],
  },

  // ── Himalaya ─────────────────────────────────────────────────────────────
  srinagar: {
    park: 'Dachigam National Park',
    note: 'Just outside Srinagar, the last refuge of the endangered Kashmir stag (hangul).',
    species: ['Hangul (Kashmir stag)', 'Himalayan black bear', 'Leopard', 'Musk deer'],
  },
  hemis: {
    park: 'Hemis National Park',
    note: 'High-altitude park widely rated the best place on earth to track wild snow leopards (winter).',
    species: ['Snow leopard', 'Bharal (blue sheep)', 'Tibetan wolf', 'Golden eagle'],
  },
  'tso-moriri': {
    park: 'Changthang Cold Desert Sanctuary',
    note: 'A Ramsar high-altitude wetland and breeding ground for rare birds on the Changthang plateau.',
    species: ['Kiang (wild ass)', 'Bar-headed goose', 'Black-necked crane', 'Tibetan gazelle'],
  },
  'tirthan-valley': {
    park: 'Great Himalayan National Park',
    note: 'A UNESCO World Heritage park of pristine Western-Himalayan forest and alpine meadow.',
    species: ['Himalayan tahr', 'Musk deer', 'Western tragopan', 'Himalayan brown bear'],
  },
  binsar: {
    park: 'Binsar Wildlife Sanctuary',
    note: 'Oak-rhododendron forest sanctuary with a 300 km Himalayan skyline from Zero Point.',
    species: ['Leopard', 'Himalayan black bear', 'Barking deer', 'Koklass pheasant'],
  },
  'valley-of-flowers': {
    park: 'Valley of Flowers National Park',
    note: 'A UNESCO alpine valley of monsoon wildflowers, also home to shy high-Himalayan mammals.',
    species: ['Blue sheep', 'Himalayan musk deer', 'Snow leopard (rare)', 'Himalayan monal'],
  },
}

export function wildlifeFor(slug: string): Wildlife | undefined {
  return WILDLIFE[slug]
}
