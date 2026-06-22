// Comprehensive catalogue of South Indian hill stations and cool-climate
// destinations. This is the SOURCE OF TRUTH for the destinations directory:
// stable reference data the user controls, so the catalogue renders instantly
// with no DB dependency and zero cost. Supabase still holds the dynamic
// community layer (WiFi readings, work spots, journeys), keyed by slug.
//
// Compiled from public sources: state tourism boards, Wikipedia's list of
// Indian hill stations, Holidify/Thrillophilia/Trawell directories, and Google
// Maps. Elevations are representative (town/plateau level) and rounded.

export type DestinationCategory = 'hill_station' | 'forest' | 'coastal' | 'gateway'

export interface HillStation {
  slug: string
  name: string
  state: string
  district: string
  region: string
  category: DestinationCategory
  elevationM: number
  lat: number
  lng: number
  summary: string
  bestSeason: string
  highlights: string[]
  remoteWorkNote: string
}

export const DEST_STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry',
] as const

export const DESTINATIONS: HillStation[] = [
  // ─────────────────────────── TAMIL NADU ───────────────────────────
  {
    slug: 'ooty', name: 'Ooty (Udhagamandalam)', state: 'Tamil Nadu', district: 'The Nilgiris',
    region: 'Nilgiris', category: 'hill_station', elevationM: 2240, lat: 11.4102, lng: 76.6950,
    summary: 'The best known hill station in the south, the "Queen of the Nilgiris", with botanical gardens, a toy train and colonial charm.',
    bestSeason: 'Oct to Jun (cold nights year round)',
    highlights: ['Nilgiri Mountain Railway', 'Botanical Gardens', 'Doddabetta Peak (2,637m)'],
    remoteWorkNote: 'BSNL fiber in town; busy in peak season so book stays with backup power.',
  },
  {
    slug: 'coonoor', name: 'Coonoor', state: 'Tamil Nadu', district: 'The Nilgiris',
    region: 'Nilgiris', category: 'hill_station', elevationM: 1858, lat: 11.3530, lng: 76.7959,
    summary: 'Quieter and milder than Ooty, set among tea estates with Sims Park and viewpoints over the plains.',
    bestSeason: 'Mar to May, Sep to Nov',
    highlights: ['Sims Park', 'Dolphins Nose viewpoint', 'Tea estate walks'],
    remoteWorkNote: 'Fiber options near the town centre; one of the more livable Nilgiri bases.',
  },
  {
    slug: 'kotagiri', name: 'Kotagiri', state: 'Tamil Nadu', district: 'The Nilgiris',
    region: 'Nilgiris', category: 'hill_station', elevationM: 1793, lat: 11.4216, lng: 76.8606,
    summary: 'The oldest and least crowded of the three Nilgiri towns, with a mild climate and clean air.',
    bestSeason: 'Year round',
    highlights: ['Catherine Falls', 'Kodanad viewpoint', 'Tea trails'],
    remoteWorkNote: 'Small and peaceful; mobile data decent, fixed-line patchier than Coonoor.',
  },
  {
    slug: 'kodaikanal', name: 'Kodaikanal', state: 'Tamil Nadu', district: 'Dindigul',
    region: 'Palani Hills', category: 'hill_station', elevationM: 2133, lat: 10.2381, lng: 77.4892,
    summary: 'The "Princess of Hill Stations" in the Palani Hills, built around a star-shaped lake amid shola forest.',
    bestSeason: 'May to Jun, Sep to Oct',
    highlights: ['Kodai Lake', 'Coakers Walk', 'Pillar Rocks'],
    remoteWorkNote: 'Strong Airtel 4G; dense fog Jun to Aug can affect outdoor work.',
  },
  {
    slug: 'yercaud', name: 'Yercaud', state: 'Tamil Nadu', district: 'Salem',
    region: 'Shevaroy Hills', category: 'hill_station', elevationM: 1515, lat: 11.7799, lng: 78.2090,
    summary: 'An affordable, low-key hill station in the Shevaroys, 35 km from Salem, with coffee and orange groves.',
    bestSeason: 'Year round',
    highlights: ['Yercaud Lake', 'Pagoda Point', 'Coffee estates'],
    remoteWorkNote: 'Growing digital-nomad presence; BSNL fiber available in town.',
  },
  {
    slug: 'valparai', name: 'Valparai', state: 'Tamil Nadu', district: 'Coimbatore',
    region: 'Anamalai Hills', category: 'hill_station', elevationM: 1193, lat: 10.3270, lng: 76.9550,
    summary: 'A remote tea-estate plateau reached by a 40-hairpin ghat, rich in wildlife and very quiet.',
    bestSeason: 'Sep to Mar',
    highlights: ['Sholayar dam', 'Tea estates', 'Lion-tailed macaque sightings'],
    remoteWorkNote: 'Surprisingly strong Airtel 4G despite the remoteness; very few distractions.',
  },
  {
    slug: 'yelagiri', name: 'Yelagiri', state: 'Tamil Nadu', district: 'Tirupattur',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1110, lat: 12.5817, lng: 78.6390,
    summary: 'A compact weekend hill station within easy reach of Bengaluru and Chennai, good for a quiet retreat.',
    bestSeason: 'Nov to Jul',
    highlights: ['Punganur Lake', 'Swamimalai Hill trek', 'Paragliding'],
    remoteWorkNote: 'Good Jio 4G; small but growing homestay scene.',
  },
  {
    slug: 'kolli-hills', name: 'Kolli Hills', state: 'Tamil Nadu', district: 'Namakkal',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1300, lat: 11.2500, lng: 78.3380,
    summary: 'An offbeat Eastern Ghats range famous for its 70-hairpin road, waterfalls and herbal farms.',
    bestSeason: 'Oct to Feb',
    highlights: ['Agaya Gangai falls', '70 hairpin bends', 'Herbal farms'],
    remoteWorkNote: 'Patchy signal; best for unplugged retreats rather than daily video calls.',
  },
  {
    slug: 'megamalai', name: 'Megamalai', state: 'Tamil Nadu', district: 'Theni',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1500, lat: 9.6300, lng: 77.4000,
    summary: 'The "High Wavy Mountains", a pristine high-range cardamom and tea country, largely undeveloped.',
    bestSeason: 'Sep to Mar',
    highlights: ['Cloud-covered tea estates', 'Wildlife sanctuary', 'Vaigai dam views'],
    remoteWorkNote: 'Very limited connectivity; ideal for offline work sprints.',
  },
  {
    slug: 'topslip', name: 'Topslip', state: 'Tamil Nadu', district: 'Coimbatore',
    region: 'Anamalai Hills', category: 'forest', elevationM: 800, lat: 10.4360, lng: 76.8240,
    summary: 'A forest base inside the Anamalai Tiger Reserve, known for trekking and elephant herds.',
    bestSeason: 'Oct to Mar',
    highlights: ['Tiger reserve treks', 'Teak forests', 'Elephant camps'],
    remoteWorkNote: 'Forest zone with minimal connectivity; a nature break, not a work base.',
  },
  {
    slug: 'sirumalai', name: 'Sirumalai', state: 'Tamil Nadu', district: 'Dindigul',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1600, lat: 10.2800, lng: 77.9800,
    summary: 'A small hill range near Dindigul known for its native banana variety and cool forested slopes.',
    bestSeason: 'Oct to Mar',
    highlights: ['Sirumalai banana', 'Viewpoints', 'Quiet drives'],
    remoteWorkNote: 'Quiet and lesser known; connectivity adequate near resorts.',
  },
  {
    slug: 'javadi-hills', name: 'Javadi Hills', state: 'Tamil Nadu', district: 'Tiruvannamalai',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1100, lat: 12.5500, lng: 78.7500,
    summary: 'An extensive, tribal Eastern Ghats range with sandalwood forests and a slow pace of life.',
    bestSeason: 'Nov to Feb',
    highlights: ['Beemanmadavu falls', 'Amirthi forest', 'Tribal villages'],
    remoteWorkNote: 'Remote and offbeat; signal patchy away from main villages.',
  },
  {
    slug: 'kalrayan-hills', name: 'Kalrayan Hills', state: 'Tamil Nadu', district: 'Salem',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1000, lat: 11.7000, lng: 78.6000,
    summary: 'A pair of tribal hill ranges between Salem and Villupuram, with waterfalls and terraced farms.',
    bestSeason: 'Oct to Feb',
    highlights: ['Megam falls', 'Periyar Nagar', 'Trekking'],
    remoteWorkNote: 'Underdeveloped for tourism; limited connectivity.',
  },
  {
    slug: 'pachamalai', name: 'Pachamalai', state: 'Tamil Nadu', district: 'Tiruchirappalli',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1000, lat: 11.3500, lng: 78.4500,
    summary: 'A green Eastern Ghats range near Trichy with springs, waterfalls and tribal hamlets.',
    bestSeason: 'Oct to Feb',
    highlights: ['Mangalam dam', 'Koraiyar falls', 'Cool forest walks'],
    remoteWorkNote: 'Day-trip territory; little formal stay or connectivity.',
  },
  {
    slug: 'gudalur', name: 'Gudalur', state: 'Tamil Nadu', district: 'The Nilgiris',
    region: 'Nilgiris', category: 'gateway', elevationM: 1100, lat: 11.5010, lng: 76.4910,
    summary: 'A green junction town between the Nilgiris, Wayanad and Mysuru, surrounded by tea and forest.',
    bestSeason: 'Sep to May',
    highlights: ['Needle Rock viewpoint', 'Tea estates', 'Gateway to three states'],
    remoteWorkNote: 'Reasonable connectivity; useful staging point rather than a destination in itself.',
  },
  {
    slug: 'mudumalai', name: 'Mudumalai', state: 'Tamil Nadu', district: 'The Nilgiris',
    region: 'Nilgiris', category: 'forest', elevationM: 1140, lat: 11.5700, lng: 76.5400,
    summary: 'A tiger reserve at the tri-junction of Tamil Nadu, Karnataka and Kerala, rich in elephants and gaur.',
    bestSeason: 'Sep to May',
    highlights: ['Safari rides', 'Elephant camp', 'Moyar river'],
    remoteWorkNote: 'Forest stays with patchy signal; better for a wildlife break.',
  },

  // ─────────────────────────── KERALA ───────────────────────────
  {
    slug: 'munnar', name: 'Munnar', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'hill_station', elevationM: 1600, lat: 10.0889, lng: 77.0595,
    summary: 'Kerala\'s flagship hill station, an expanse of rolling tea estates in the high ranges of Idukki.',
    bestSeason: 'Sep to May',
    highlights: ['Tea estates', 'Eravikulam National Park', 'Top Station viewpoint'],
    remoteWorkNote: 'Strong Airtel and Jio 4G; a growing homestay and cafe scene.',
  },
  {
    slug: 'wayanad', name: 'Wayanad (Kalpetta)', state: 'Kerala', district: 'Wayanad',
    region: 'Western Ghats', category: 'hill_station', elevationM: 780, lat: 11.6083, lng: 76.0820,
    summary: 'A plateau district of spice and coffee estates, caves and waterfalls, increasingly popular with nomads.',
    bestSeason: 'Sep to May',
    highlights: ['Edakkal Caves', 'Chembra Peak', 'Banasura dam'],
    remoteWorkNote: 'Reliable 4G in town areas; one of Kerala\'s top remote-work picks.',
  },
  {
    slug: 'vythiri', name: 'Vythiri', state: 'Kerala', district: 'Wayanad',
    region: 'Western Ghats', category: 'forest', elevationM: 700, lat: 11.5500, lng: 76.0400,
    summary: 'Wayanad\'s resort belt, full of tree-houses and rainforest eco-lodges near the Lakkidi ghat.',
    bestSeason: 'Sep to May',
    highlights: ['Tree-house stays', 'Pookode Lake', 'Rainforest walks'],
    remoteWorkNote: 'Premium resorts with good WiFi; pricier than Kalpetta town.',
  },
  {
    slug: 'thekkady', name: 'Thekkady (Kumily)', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'forest', elevationM: 900, lat: 9.6037, lng: 77.1601,
    summary: 'The gateway to Periyar Tiger Reserve, set in spice plantations on the Kerala-Tamil Nadu border.',
    bestSeason: 'Oct to Mar',
    highlights: ['Periyar lake boating', 'Spice plantations', 'Bamboo rafting'],
    remoteWorkNote: 'Good Jio and Airtel; many homestays with reliable WiFi.',
  },
  {
    slug: 'vagamon', name: 'Vagamon', state: 'Kerala', district: 'Idukki',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1100, lat: 9.6850, lng: 76.9000,
    summary: 'Rolling green meadows and pine forests on the Kottayam-Idukki border, quieter than Munnar.',
    bestSeason: 'Aug to Mar',
    highlights: ['Meadows and pine forest', 'Paragliding', 'Tea gardens'],
    remoteWorkNote: 'Connectivity is improving steadily; a calm alternative to Munnar.',
  },
  {
    slug: 'ponmudi', name: 'Ponmudi', state: 'Kerala', district: 'Thiruvananthapuram',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1100, lat: 8.7600, lng: 77.1200,
    summary: 'A misty hill station just 60 km from Thiruvananthapuram, with hairpin roads and shola forest.',
    bestSeason: 'Aug to Mar',
    highlights: ['Golden valley', 'Hairpin drives', 'Forest trails'],
    remoteWorkNote: 'Good for city-escape work weeks; carry a hotspot for the upper reaches.',
  },
  {
    slug: 'nelliyampathy', name: 'Nelliyampathy', state: 'Kerala', district: 'Palakkad',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1500, lat: 10.5350, lng: 76.6960,
    summary: 'A quiet range of orange, cardamom and coffee plantations reached by a scenic ghat from Palakkad.',
    bestSeason: 'Aug to Mar',
    highlights: ['Seethargundu viewpoint', 'Orange orchards', 'Pothundi dam'],
    remoteWorkNote: 'Underrated and peaceful; connectivity limited but improving.',
  },
  {
    slug: 'peermade', name: 'Peermade', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'hill_station', elevationM: 915, lat: 9.5740, lng: 76.9800,
    summary: 'A plantation hill town on the road to Thekkady, with tea, coffee, cardamom and rubber estates.',
    bestSeason: 'Sep to Mar',
    highlights: ['Plantation walks', 'Grassy hills', 'Waterfalls'],
    remoteWorkNote: 'Decent mobile data; quiet plantation stays.',
  },
  {
    slug: 'devikulam', name: 'Devikulam', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'hill_station', elevationM: 1800, lat: 10.0500, lng: 77.1000,
    summary: 'A high, serene hill town near Munnar centred on the Sita Devi lake, with mineral springs.',
    bestSeason: 'Sep to May',
    highlights: ['Sita Devi lake', 'Tea estates', 'Trout fishing'],
    remoteWorkNote: 'Close enough to Munnar for amenities; carry a backup connection.',
  },
  {
    slug: 'marayoor', name: 'Marayoor', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'hill_station', elevationM: 1000, lat: 10.2770, lng: 77.1620,
    summary: 'Famous for natural sandalwood forests, sugarcane jaggery and dolmens, north of Munnar.',
    bestSeason: 'Sep to Mar',
    highlights: ['Sandalwood forest', 'Muniyara dolmens', 'Thoovanam falls'],
    remoteWorkNote: 'Small town with basic connectivity; an easy add-on to a Munnar stay.',
  },
  {
    slug: 'lakkidi', name: 'Lakkidi', state: 'Kerala', district: 'Wayanad',
    region: 'Western Ghats', category: 'gateway', elevationM: 700, lat: 11.5300, lng: 76.0300,
    summary: 'The misty gateway to Wayanad at the top of the Thamarassery ghat, one of the wettest spots in the south.',
    bestSeason: 'Sep to May',
    highlights: ['Thamarassery ghat views', 'Pookode Lake nearby', 'Chain tree legend'],
    remoteWorkNote: 'A scenic pass town; most stays cluster toward Vythiri and Kalpetta.',
  },
  {
    slug: 'ramakkalmedu', name: 'Ramakkalmedu', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'hill_station', elevationM: 1100, lat: 9.6900, lng: 77.1500,
    summary: 'A windswept ridge near Thekkady with sweeping views over the Tamil Nadu plains and strong breezes.',
    bestSeason: 'Sep to Mar',
    highlights: ['Kuravan and Kurathi statues', 'Wind farms', 'Plains views'],
    remoteWorkNote: 'Best as a viewpoint day trip from Thekkady or Kumily.',
  },
  {
    slug: 'gavi', name: 'Gavi', state: 'Kerala', district: 'Pathanamthitta',
    region: 'Cardamom Hills', category: 'forest', elevationM: 1000, lat: 9.4400, lng: 77.1600,
    summary: 'An eco-tourism forest village inside the Periyar belt, known for birding and guided treks.',
    bestSeason: 'Oct to Mar',
    highlights: ['Guided eco-treks', 'Birdwatching', 'Forest camping'],
    remoteWorkNote: 'Deep forest with minimal signal; an off-grid nature stay.',
  },
  {
    slug: 'silent-valley', name: 'Silent Valley (Mukkali)', state: 'Kerala', district: 'Palakkad',
    region: 'Western Ghats', category: 'forest', elevationM: 1000, lat: 11.0900, lng: 76.4400,
    summary: 'One of India\'s last untouched tropical rainforests, accessed from Mukkali in Palakkad.',
    bestSeason: 'Dec to Apr',
    highlights: ['Pristine rainforest', 'Lion-tailed macaque', 'Kunthi river'],
    remoteWorkNote: 'Protected core with no connectivity; strictly a nature visit.',
  },
  {
    slug: 'eravikulam', name: 'Eravikulam (Anamudi)', state: 'Kerala', district: 'Idukki',
    region: 'Cardamom Hills', category: 'forest', elevationM: 2000, lat: 10.1900, lng: 77.0500,
    summary: 'A high-altitude national park above Munnar, home to the Nilgiri tahr and Anamudi, the highest peak in the south.',
    bestSeason: 'Sep to Nov, Apr to May',
    highlights: ['Nilgiri tahr', 'Anamudi (2,695m)', 'Neelakurinji blooms'],
    remoteWorkNote: 'A park visit from Munnar; no stays inside, work from Munnar instead.',
  },

  // ─────────────────────────── KARNATAKA ───────────────────────────
  {
    slug: 'coorg', name: 'Coorg (Madikeri)', state: 'Karnataka', district: 'Kodagu',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1525, lat: 12.4244, lng: 75.7382,
    summary: 'The "Scotland of India", coffee-plantation country with planters\' bungalows, waterfalls and a slow pace.',
    bestSeason: 'Sep to Mar',
    highlights: ['Coffee estates', 'Abbey Falls', 'Raja\'s Seat viewpoint'],
    remoteWorkNote: 'Reliable 4G; plantation homestays make excellent work bases.',
  },
  {
    slug: 'chikmagalur', name: 'Chikmagalur', state: 'Karnataka', district: 'Chikkamagaluru',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1090, lat: 13.3161, lng: 75.7720,
    summary: 'The birthplace of Indian coffee, ringed by the Baba Budan range and Mullayanagiri, the state\'s highest peak.',
    bestSeason: 'Sep to Mar',
    highlights: ['Coffee estates', 'Mullayanagiri trek', 'Hebbe Falls'],
    remoteWorkNote: 'Good Airtel and Jio coverage; affordable estate stays, rising nomad scene.',
  },
  {
    slug: 'sakleshpur', name: 'Sakleshpur', state: 'Karnataka', district: 'Hassan',
    region: 'Western Ghats', category: 'hill_station', elevationM: 949, lat: 12.9430, lng: 75.7850,
    summary: 'Green hills and spice estates under three hours from Bengaluru, quieter than Coorg.',
    bestSeason: 'Sep to Mar',
    highlights: ['Bisle ghat viewpoint', 'Manjarabad Fort', 'Plantation walks'],
    remoteWorkNote: 'Reasonable 4G; a convenient short-hop work retreat from Bengaluru.',
  },
  {
    slug: 'kemmanagundi', name: 'Kemmanagundi', state: 'Karnataka', district: 'Chikkamagaluru',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1434, lat: 13.5500, lng: 75.7600,
    summary: 'A garden hill station in the Baba Budan range with waterfalls, rock gardens and sunset points.',
    bestSeason: 'Sep to Mar',
    highlights: ['Hebbe and Kalhatti falls', 'Z Point trek', 'Rose garden'],
    remoteWorkNote: 'Limited connectivity; great for offline deep-work sprints.',
  },
  {
    slug: 'nandi-hills', name: 'Nandi Hills', state: 'Karnataka', district: 'Chikkaballapur',
    region: 'Nandidurga', category: 'hill_station', elevationM: 1478, lat: 13.3700, lng: 77.6830,
    summary: 'A historic fortified hill 60 km from Bengaluru, famous for sunrise above a sea of clouds.',
    bestSeason: 'Sep to Feb',
    highlights: ['Sunrise viewpoint', 'Tipu\'s Drop', 'Cycling climbs'],
    remoteWorkNote: 'Good 4G; day-trip favourite with limited overnight options.',
  },
  {
    slug: 'kudremukh', name: 'Kudremukh', state: 'Karnataka', district: 'Chikkamagaluru',
    region: 'Western Ghats', category: 'forest', elevationM: 1894, lat: 13.2240, lng: 75.2620,
    summary: 'A "horse-face" peak and national park of shola-grassland, one of the best treks in the south.',
    bestSeason: 'Oct to Feb',
    highlights: ['Kudremukh peak trek', 'Shola grasslands', 'Hanuman Gundi falls'],
    remoteWorkNote: 'Forest and trekking zone; minimal connectivity.',
  },
  {
    slug: 'agumbe', name: 'Agumbe', state: 'Karnataka', district: 'Shivamogga',
    region: 'Western Ghats', category: 'forest', elevationM: 643, lat: 13.5030, lng: 75.0940,
    summary: 'The "Cherrapunji of the South", a rainforest village famous for sunsets and king cobra research.',
    bestSeason: 'Oct to Feb (avoid the monsoon downpours)',
    highlights: ['Sunset Point', 'Rainforest research station', 'Barkana Falls'],
    remoteWorkNote: 'Limited connectivity; off-season is surprisingly sunny and quiet.',
  },
  {
    slug: 'br-hills', name: 'BR Hills', state: 'Karnataka', district: 'Chamarajanagar',
    region: 'Biligirirangana', category: 'forest', elevationM: 1100, lat: 11.9700, lng: 77.1500,
    summary: 'The Biligirirangana Hills, a tribal forest reserve linking the Western and Eastern Ghats.',
    bestSeason: 'Oct to Mar',
    highlights: ['Wildlife safari', 'Tribal Soliga culture', 'Hilltop temple'],
    remoteWorkNote: 'Remote forest; very limited connectivity, an off-the-grid stay.',
  },
  {
    slug: 'mullayanagiri', name: 'Mullayanagiri', state: 'Karnataka', district: 'Chikkamagaluru',
    region: 'Baba Budan Range', category: 'hill_station', elevationM: 1930, lat: 13.3920, lng: 75.7190,
    summary: 'The highest peak in Karnataka, a popular trek and drive above Chikmagalur with cloud views.',
    bestSeason: 'Sep to Mar',
    highlights: ['Summit trek', 'Cloud-level views', 'Sunset drives'],
    remoteWorkNote: 'A peak visit; base yourself in Chikmagalur town for work.',
  },
  {
    slug: 'baba-budangiri', name: 'Baba Budangiri', state: 'Karnataka', district: 'Chikkamagaluru',
    region: 'Baba Budan Range', category: 'hill_station', elevationM: 1895, lat: 13.4300, lng: 75.7600,
    summary: 'A sacred range above Chikmagalur where coffee was first grown in India, with caves and peaks.',
    bestSeason: 'Sep to Mar',
    highlights: ['Manikyadhara falls', 'Cave shrine', 'Honnamana Halla'],
    remoteWorkNote: 'Patchy signal on the range; stay in Chikmagalur for connectivity.',
  },
  {
    slug: 'kodachadri', name: 'Kodachadri', state: 'Karnataka', district: 'Shivamogga',
    region: 'Western Ghats', category: 'forest', elevationM: 1343, lat: 13.8600, lng: 74.8700,
    summary: 'A dense Western Ghats peak near Kollur, a classic jeep-and-trek destination above the clouds.',
    bestSeason: 'Oct to Feb',
    highlights: ['Peak trek', 'Hidlumane falls', 'Sarvajna Peetha'],
    remoteWorkNote: 'Trek and forest zone; little to no connectivity at the top.',
  },
  {
    slug: 'kabini', name: 'Kabini', state: 'Karnataka', district: 'Mysuru',
    region: 'Nagarhole', category: 'forest', elevationM: 780, lat: 11.9700, lng: 76.3500,
    summary: 'A famous wildlife destination on the Kabini backwaters at the edge of Nagarhole National Park.',
    bestSeason: 'Oct to May',
    highlights: ['Boat and jeep safaris', 'Leopard and elephant sightings', 'Backwater lodges'],
    remoteWorkNote: 'Upscale eco-resorts have good WiFi; little public connectivity.',
  },
  {
    slug: 'devarayanadurga', name: 'Devarayanadurga', state: 'Karnataka', district: 'Tumakuru',
    region: 'Eastern fringe', category: 'hill_station', elevationM: 1200, lat: 13.3700, lng: 77.2200,
    summary: 'A rocky, temple-topped hill near Tumakuru, an easy forested escape from Bengaluru.',
    bestSeason: 'Sep to Feb',
    highlights: ['Hilltop temples', 'Namada Chilume spring', 'Boulder landscapes'],
    remoteWorkNote: 'Day-trip hill; few stays, decent signal at the base.',
  },
  {
    slug: 'skandagiri', name: 'Skandagiri', state: 'Karnataka', district: 'Chikkaballapur',
    region: 'Nandidurga', category: 'hill_station', elevationM: 1450, lat: 13.5100, lng: 77.6800,
    summary: 'A night-trek favourite near Nandi Hills, climbed for dawn above the clouds.',
    bestSeason: 'Sep to Feb',
    highlights: ['Night trek', 'Cloud sunrise', 'Ruined fort'],
    remoteWorkNote: 'A trek rather than a stay; base in Bengaluru or Chikkaballapur.',
  },
  {
    slug: 'charmadi', name: 'Charmadi Ghat', state: 'Karnataka', district: 'Dakshina Kannada',
    region: 'Western Ghats', category: 'gateway', elevationM: 1000, lat: 13.0300, lng: 75.4800,
    summary: 'A lush, winding ghat linking the coast to Chikmagalur, full of waterfalls and viewpoints.',
    bestSeason: 'Sep to Feb',
    highlights: ['Ghat viewpoints', 'Monsoon waterfalls', 'Alekan falls'],
    remoteWorkNote: 'A scenic pass with a few homestays; signal patchy on the ghat.',
  },
  {
    slug: 'mandalpatti', name: 'Mandalpatti', state: 'Karnataka', district: 'Kodagu',
    region: 'Western Ghats', category: 'hill_station', elevationM: 1600, lat: 12.3600, lng: 75.6200,
    summary: 'A high viewpoint near Madikeri reached by jeep, famous for sunrise over a sea of mist.',
    bestSeason: 'Sep to Mar',
    highlights: ['Sunrise viewpoint', 'Jeep trails', 'Misty peaks'],
    remoteWorkNote: 'A viewpoint excursion from Madikeri, where you should base for work.',
  },
  {
    slug: 'savandurga', name: 'Savandurga', state: 'Karnataka', district: 'Ramanagara',
    region: 'Deccan', category: 'hill_station', elevationM: 1226, lat: 12.9180, lng: 77.2960,
    summary: 'One of Asia\'s largest monolith hills, a day-trip climb and trekking spot near Bengaluru.',
    bestSeason: 'Oct to Feb',
    highlights: ['Monolith climb', 'Temples at the base', 'Arkavathi river'],
    remoteWorkNote: 'A day climb; not a stay, but close to Bengaluru amenities.',
  },

  // ─────────────────────────── ANDHRA PRADESH ───────────────────────────
  {
    slug: 'araku-valley', name: 'Araku Valley', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1300, lat: 18.3271, lng: 82.8740,
    summary: 'The "Ooty of Andhra", a coffee-growing tribal valley reached by one of India\'s most scenic train rides.',
    bestSeason: 'Oct to Mar',
    highlights: ['Scenic train from Vizag', 'Coffee museum', 'Borra Caves'],
    remoteWorkNote: 'Good Jio coverage; growing tourist infrastructure.',
  },
  {
    slug: 'horsley-hills', name: 'Horsley Hills', state: 'Andhra Pradesh', district: 'Annamayya',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1265, lat: 13.6590, lng: 78.4030,
    summary: 'A small, calm hill station near the Karnataka border, the "Ooty of Andhra Pradesh" for the south of the state.',
    bestSeason: 'Sep to Mar',
    highlights: ['Eucalyptus avenues', 'Viewpoints', 'Mallamma temple'],
    remoteWorkNote: 'Good 4G; quiet and lesser known, a cool escape for south AP.',
  },
  {
    slug: 'lambasingi', name: 'Lambasingi', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju',
    region: 'Eastern Ghats', category: 'hill_station', elevationM: 1025, lat: 17.8000, lng: 82.4900,
    summary: 'The "Kashmir of Andhra", a tribal village that drops near freezing in winter, rare for the south.',
    bestSeason: 'Nov to Jan (for the cold)',
    highlights: ['Near-freezing winters', 'Apple and coffee farms', 'Thajangi reservoir'],
    remoteWorkNote: 'Connectivity is improving; very cold and scenic in deep winter.',
  },
  {
    slug: 'maredumilli', name: 'Maredumilli', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju',
    region: 'Eastern Ghats', category: 'forest', elevationM: 900, lat: 17.5300, lng: 81.7300,
    summary: 'A dense evergreen forest area with waterfalls and tribal eco-camps, east of the Godavari.',
    bestSeason: 'Oct to Feb',
    highlights: ['Amruthadhara falls', 'Bamboo chicken', 'Eco-camps'],
    remoteWorkNote: 'Forest tourism with limited signal; a nature break.',
  },
  {
    slug: 'nallamala', name: 'Nallamala Hills (Srisailam)', state: 'Andhra Pradesh', district: 'Nandyal',
    region: 'Eastern Ghats', category: 'forest', elevationM: 1100, lat: 16.0730, lng: 78.8680,
    summary: 'A vast tiger-reserve range along the Krishna gorge, centred on the Srisailam pilgrimage town.',
    bestSeason: 'Oct to Feb',
    highlights: ['Srisailam dam and temple', 'Tiger reserve', 'Krishna gorge viewpoints'],
    remoteWorkNote: 'Connectivity around Srisailam town; forest interior is off-grid.',
  },

  // ─────────────────────────── TELANGANA ───────────────────────────
  {
    slug: 'ananthagiri', name: 'Ananthagiri Hills', state: 'Telangana', district: 'Vikarabad',
    region: 'Deccan', category: 'hill_station', elevationM: 700, lat: 17.5500, lng: 78.0000,
    summary: 'A forested hill range 90 km from Hyderabad with coffee trails, the source of the Musi river.',
    bestSeason: 'Oct to Mar',
    highlights: ['Coffee trails', 'Anantha Padmanabha temple', 'Forest trekking'],
    remoteWorkNote: 'Forest homestays with decent 4G; a good weekend work retreat from Hyderabad.',
  },
  {
    slug: 'farahabad', name: 'Farahabad (Amrabad)', state: 'Telangana', district: 'Nagarkurnool',
    region: 'Nallamala', category: 'forest', elevationM: 850, lat: 16.2400, lng: 78.9500,
    summary: 'A viewpoint deep in the Amrabad Tiger Reserve, overlooking the Nallamala forest and Krishna valley.',
    bestSeason: 'Oct to Feb',
    highlights: ['Nallamala viewpoint', 'Tiger reserve', 'Dense forest drives'],
    remoteWorkNote: 'Protected forest with minimal connectivity; a nature visit only.',
  },

  // ─────────────────────────── PUDUCHERRY ───────────────────────────
  {
    slug: 'puducherry', name: 'Puducherry', state: 'Puducherry', district: 'Puducherry',
    region: 'Coromandel Coast', category: 'coastal', elevationM: 5, lat: 11.9416, lng: 79.8083,
    summary: 'Not a hill station but a top southern remote-work base: French-quarter cafes, beaches and a real coworking scene.',
    bestSeason: 'Oct to Mar',
    highlights: ['French Quarter', 'Beach cafes', 'Auroville'],
    remoteWorkNote: 'Excellent fiber via Airtel and BSNL; the most work-ready spot on this list, viable year round.',
  },
]

export const DESTINATION_CATEGORIES: { id: DestinationCategory; label: string }[] = [
  { id: 'hill_station', label: 'Hill stations' },
  { id: 'forest', label: 'Forest & wildlife' },
  { id: 'gateway', label: 'Gateways & ghats' },
  { id: 'coastal', label: 'Coastal' },
]

export function getDestination(slug: string): HillStation | undefined {
  return DESTINATIONS.find((d) => d.slug === slug)
}
