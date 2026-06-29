// Curated, practical travel-safety advisories for destinations that genuinely
// need care: high-altitude (AMS) zones, snow-closed passes, border/permit areas
// and remote valleys. Kept factual and neutral - altitude, weather windows,
// permits, connectivity - NOT political commentary. The Overview tab renders a
// "Good to know before you go" card whenever advisoryFor(slug) returns an entry,
// and always reminds the visitor to check current official advisories.

export type AdvisoryLevel = 'caution' | 'high'

export interface Advisory {
  level: AdvisoryLevel
  points: string[]
}

export const ADVISORIES: Record<string, Advisory> = {
  // ── Jammu & Kashmir ──────────────────────────────────────────────────────
  srinagar: {
    level: 'caution',
    points: [
      'Only POSTPAID SIMs issued outside J&K get mobile service - prepaid cards will not work.',
      'Conditions can change; check current local and government travel advisories before you book.',
      'Dress modestly and respect local customs, especially near shrines and during prayers.',
    ],
  },
  gulmarg: {
    level: 'caution',
    points: [
      'The Apharwat gondola climbs to ~3,950 m near the LoC - follow operator and army instructions.',
      'Weather turns fast up high; carry warm, waterproof layers even in summer.',
      'Postpaid SIM only.',
    ],
  },
  pahalgam: {
    level: 'caution',
    points: [
      'Flash floods can hit the Lidder - avoid riverbeds in heavy rain.',
      'Pony and taxi rates are union-fixed; agree the fare in writing before you set off.',
      'Postpaid SIM only.',
    ],
  },
  sonamarg: {
    level: 'caution',
    points: [
      'The Zoji La road beyond Sonamarg is shut in winter and dangerous in bad weather.',
      'High glacial terrain - acclimatize, dress warm and watch the weather.',
      'Postpaid SIM only.',
    ],
  },
  'gurez-valley': {
    level: 'high',
    points: [
      'A Line-of-Control border zone: carry a valid government photo ID and obey all army checkpoints.',
      'The Razdan Pass road is snow-closed roughly November to April.',
      'Mobile and data coverage is almost nonexistent - share your plan before you go.',
    ],
  },
  doodhpathri: {
    level: 'caution',
    points: [
      'A day-trip meadow with no medical facilities - carry essentials and head back before dark.',
      'Little to no signal; postpaid SIM only.',
    ],
  },
  yusmarg: {
    level: 'caution',
    points: [
      'Quiet meadow with minimal infrastructure - bring your own food and water.',
      'Little to no signal; postpaid SIM only.',
    ],
  },
  patnitop: {
    level: 'caution',
    points: ['Foggy mountain roads with sharp bends - drive slowly, especially after dark.'],
  },
  bhaderwah: {
    level: 'caution',
    points: ['Remote Chenab-valley roads can be hit by landslides in the monsoon - check conditions.'],
  },
  'sinthan-top': {
    level: 'high',
    points: [
      'At 3,748 m the pass is snow-bound most of the year and open only ~June to September.',
      'No fuel, food or signal at the top - carry your own and turn back if you feel unwell.',
    ],
  },

  // ── Ladakh ───────────────────────────────────────────────────────────────
  leh: {
    level: 'high',
    points: [
      'At 3,500 m, rest your first 36-48 hours to avoid Acute Mountain Sickness (AMS).',
      'Only postpaid SIMs work here; carry cash, as ATMs are few and often empty.',
      'Stay hydrated and avoid alcohol while acclimatizing.',
    ],
  },
  'nubra-valley': {
    level: 'high',
    points: [
      'Requires an Inner Line Permit, arranged in Leh.',
      'Reached over Khardung La (~5,359 m) - ascend gradually and descend if AMS worsens.',
      'Freezing nights year-round; power and signal are intermittent.',
    ],
  },
  'pangong-tso': {
    level: 'high',
    points: [
      'Requires an Inner Line Permit.',
      'At 4,350 m, AMS is a real risk - do not rush the ascent and descend if symptoms worsen.',
      'Lakeside nights are freezing in every season; carry cash and warm gear.',
    ],
  },
  'khardung-la': {
    level: 'high',
    points: [
      'At ~5,359 m, stop only 20-30 minutes and never sleep at the pass - AMS can be life-threatening.',
      'Snow and ice can close it without warning; cross early in the day.',
      'An Inner Line Permit is needed to continue to Nubra.',
    ],
  },
  'tso-moriri': {
    level: 'high',
    points: [
      'Requires an Inner Line Permit; very remote with no reliable signal.',
      'At 4,522 m, full acclimatization is essential before you visit.',
      'A protected wetland - keep your distance from wildlife and carry out all waste.',
    ],
  },
  hemis: {
    level: 'caution',
    points: [
      'Winter snow-leopard treks are serious high-altitude expeditions - book licensed guides.',
      'Respect monastery dress codes and photography rules.',
    ],
  },
  zanskar: {
    level: 'high',
    points: [
      'One of India’s remotest valleys: fuel, food and comms are scarce - carry buffers.',
      'Roads open only ~June to September; the winter Chadar trek is a serious guided expedition.',
    ],
  },
  'umling-la': {
    level: 'high',
    points: [
      'At ~5,883 m (the world’s highest road), attempt it ONLY when fully acclimatized after days in Ladakh.',
      'Near the LAC: permits are required and conditions change - go with an experienced operator.',
      'Severe cold, thin air and no facilities - carry oxygen and emergency supplies.',
    ],
  },

  // ── Himachal Pradesh ─────────────────────────────────────────────────────
  'rohtang-pass': {
    level: 'high',
    points: [
      'Requires an online permit with a daily vehicle cap - book ahead.',
      'Open roughly May to October; weather can shut it within minutes.',
      'At ~3,978 m, don’t over-exert and carry warm clothing.',
    ],
  },
  'spiti-valley': {
    level: 'high',
    points: [
      'Cold-desert altitude (3,500-4,500 m) - acclimatize via Shimla/Kinnaur, not a fast climb from Manali.',
      'Fuel only at Kaza; mobile coverage is mainly BSNL and patchy.',
      'Rough, weather-dependent roads - keep buffer days in your plan.',
    ],
  },
  kalpa: {
    level: 'caution',
    points: [
      'Inner-Kinnaur roads are landslide-prone, especially in the monsoon - check conditions.',
      'Some inner areas require an Inner Line Permit.',
    ],
  },
  chitkul: {
    level: 'caution',
    points: [
      'A border village - carry photo ID; areas beyond are restricted.',
      'Cold even in summer, and the road closes with early snow.',
    ],
  },
  manali: {
    level: 'caution',
    points: ['Day-trips to Rohtang/Atal Tunnel cross 3,000 m+ - carry warm clothes and watch for AMS.'],
  },
  dharamshala: {
    level: 'caution',
    points: ['The Triund and Dharamkot treks gain altitude fast - carry water and turn back in storms.'],
  },

  // ── Uttarakhand ──────────────────────────────────────────────────────────
  auli: {
    level: 'caution',
    points: [
      'Reached via Joshimath, which has seen ground-subsidence - follow local advisories on stays.',
      'Snow and weather can disrupt the cable car and roads.',
    ],
  },
  chopta: {
    level: 'caution',
    points: [
      'The Tungnath/Chandrashila climb reaches ~3,680-4,000 m - go slow and start early.',
      'Snowbound and facilities-free in winter.',
    ],
  },
  'valley-of-flowers': {
    level: 'high',
    points: [
      'A 3,600 m trek-in national park, open only ~June to October, with no stay inside.',
      'The monsoon bloom also brings landslides - check the road status to Govindghat.',
      'Carry rain gear and start early to return to Ghangaria by evening.',
    ],
  },
  munsiyari: {
    level: 'caution',
    points: ['Remote Kumaon roads; winter snow can cut access for days at a time.'],
  },
  nainital: {
    level: 'caution',
    points: ['Severe peak-season traffic and parking - arrive early or stay above the lake.'],
  },
  mussoorie: {
    level: 'caution',
    points: ['Heavy peak-season congestion on the Mall - park outside the centre and walk.'],
  },
}

export function advisoryFor(slug: string): Advisory | undefined {
  return ADVISORIES[slug]
}
