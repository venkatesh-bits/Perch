-- Expand destination table with type categorisation
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS
  category TEXT DEFAULT 'hill_station'
  CHECK (category IN ('hill_station', 'coastal', 'city', 'forest', 'heritage', 'gateway'));

-- Remove placeholder destinations that don't belong as travel targets
-- (Chennai was only in migration 001 seed; keep others)

-- ─── COMPREHENSIVE SOUTH INDIA DESTINATIONS ──────────────────────────────────

INSERT INTO destinations (name, slug, state, elevation_m, category, climate_notes, location) VALUES

-- ── Tamil Nadu hill stations ─────────────────────────────────────────────────
('Ooty (Udhagamandalam)', 'ooty',        'Tamil Nadu', 2240, 'hill_station',
 'Cold nights year-round. Busy Apr-Jun and Oct-Nov. Best work months Jan-Mar, Aug-Sep. BSNL fiber in town.',
 ST_Point(76.6950, 11.4102)::geography),

('Coonoor',              'coonoor',      'Tamil Nadu', 1858, 'hill_station',
 'Cool and mild year-round. Quieter than Ooty. Fiber options near town centre. Best work window Mar-May.',
 ST_Point(76.7959, 11.3530)::geography),

('Kodaikanal',           'kodaikanal',   'Tamil Nadu', 2133, 'hill_station',
 'Pleasant May-Jun and Sep-Oct. Dense fog limits outdoor work Jun-Aug. Strong Airtel 4G throughout.',
 ST_Point(77.4892, 10.2381)::geography),

('Yercaud',              'yercaud',      'Tamil Nadu', 1515, 'hill_station',
 'Less touristy, affordable. Growing digital-nomad presence. BSNL fiber available in town. 35 km from Salem.',
 ST_Point(78.2090, 11.7799)::geography),

('Valparai',             'valparai',     'Tamil Nadu', 1370, 'hill_station',
 'Tea estate country. Very quiet. Strong Airtel 4G despite remoteness. Long 64-hairpin ghat drive.',
 ST_Point(76.9553, 10.3263)::geography),

('Yelagiri',             'yelagiri',     'Tamil Nadu', 1100, 'hill_station',
 'Weekend retreat distance from Chennai. Small and peaceful. Growing homestay scene. Good Jio 4G.',
 ST_Point(78.6398, 12.5917)::geography),

('Kolli Hills',          'kolli-hills',  'Tamil Nadu', 1300, 'hill_station',
 'Remote and offbeat. Patchy Airtel signal. Best for unplugged retreats, not daily video calls.',
 ST_Point(78.3210, 11.2360)::geography),

('Megamalai',            'megamalai',    'Tamil Nadu', 1500, 'hill_station',
 'Pristine high-range forest. Very limited connectivity. Ideal for offline work sprints.',
 ST_Point(77.3568,  9.8942)::geography),

('Tenkasi',              'tenkasi',      'Tamil Nadu',  160, 'gateway',
 'Gateway to Courtallam waterfalls. Plains climate, cooler forest fringe areas. Good 4G coverage.',
 ST_Point(77.3151,  8.9606)::geography),

-- ── Karnataka hill stations ───────────────────────────────────────────────────
('Coorg (Madikeri)',     'coorg',        'Karnataka',  1525, 'hill_station',
 'Coffee-plantation country. Reliable 4G. Planters'' bungalows as homestays. Scenic, slower pace. Best Sep-Mar.',
 ST_Point(75.7382, 12.4244)::geography),

('Chikmagalur',          'chikmagalur',  'Karnataka',  1090, 'hill_station',
 'Rapidly popular with remote workers. Good Airtel and Jio coverage. Affordable coffee-estate stays.',
 ST_Point(75.7762, 13.3153)::geography),

('Sakleshpur',           'sakleshpur',   'Karnataka',   949, 'hill_station',
 'Green hills and spice estates. Reasonable 4G. Quieter alternative to Coorg. Under 3 hrs from Bangalore.',
 ST_Point(75.7982, 12.9488)::geography),

('Kemmanagundi',         'kemmanagundi', 'Karnataka',  1434, 'hill_station',
 'Dense forest, waterfalls. Very limited connectivity - excellent for deep-work offline sprints.',
 ST_Point(75.7440, 13.5305)::geography),

('Nandi Hills',          'nandi-hills',  'Karnataka',  1478, 'hill_station',
 '60 km from Bangalore. Day trip or weekend stay. Good 4G. Limited accommodation options.',
 ST_Point(77.6854, 13.3702)::geography),

('Kabini',               'kabini',       'Karnataka',   780, 'forest',
 'Wildlife and forest destination. Upscale eco-resorts have good WiFi. Limited public internet.',
 ST_Point(76.3426, 11.9420)::geography),

('BR Hills',             'br-hills',     'Karnataka',  1100, 'forest',
 'Biligirirangana Hills. Remote tribal forest. Very limited connectivity. Off-the-grid destination.',
 ST_Point(77.1810, 11.9780)::geography),

('Agumbe',               'agumbe',       'Karnataka',   658, 'forest',
 'Highest rainfall in South India. Lush forest. Limited connectivity. Off-season is surprisingly sunny.',
 ST_Point(75.0941, 13.5030)::geography),

-- ── Kerala hill stations ──────────────────────────────────────────────────────
('Munnar',               'munnar',       'Kerala',     1600, 'hill_station',
 'Tea-estate country. Strong Airtel and Jio 4G. Growing homestay scene. Very scenic throughout the year.',
 ST_Point(77.0595, 10.0889)::geography),

('Wayanad (Kalpetta)',   'wayanad',      'Kerala',      780, 'hill_station',
 'Spice and coffee estates. Growing digital-nomad presence. Reliable 4G in town areas. Sep-May best.',
 ST_Point(76.0820, 11.6083)::geography),

('Thekkady (Kumily)',    'thekkady',     'Kerala',      900, 'forest',
 'Near Periyar Tiger Reserve. Good Jio and Airtel. Many homestays with reliable WiFi.',
 ST_Point(77.1601,  9.6037)::geography),

('Vagamon',              'vagamon',      'Kerala',     1100, 'hill_station',
 'Rolling meadows, quiet. Less visited than Munnar. Connectivity improving steadily.',
 ST_Point(76.9009,  9.6846)::geography),

('Ponmudi',              'ponmudi',      'Kerala',     1100, 'hill_station',
 'Thiruvananthapuram district. 60 km from the city. Misty forests. Good for city-escape work weeks.',
 ST_Point(77.0868,  8.7468)::geography),

('Nelliyampathy',        'nelliyampathy','Kerala',      467, 'hill_station',
 'Palakkad district. Cardamom and orange plantations. Quiet and underrated. Limited but improving 4G.',
 ST_Point(76.6700, 10.5700)::geography),

('Vythiri',              'vythiri',      'Kerala',      700, 'forest',
 'Wayanad''s resort belt. High-end tree-houses and eco-lodges with good WiFi. Premium pricing.',
 ST_Point(75.9800, 11.5840)::geography),

-- ── Andhra Pradesh hill stations ──────────────────────────────────────────────
('Araku Valley',         'araku-valley', 'Andhra Pradesh', 1100, 'hill_station',
 'Tribal hill station near Vizag. Famous scenic train journey. Growing tourist infrastructure. Good Jio.',
 ST_Point(82.8740, 18.3271)::geography),

('Horsley Hills',        'horsley-hills','Andhra Pradesh', 1265, 'hill_station',
 'Small, quiet hill station near Kadapa. Good 4G. Less-known, cooler alternative for south AP travellers.',
 ST_Point(78.3944, 13.6589)::geography),

('Lambasingi',           'lambasingi',   'Andhra Pradesh', 1000, 'hill_station',
 'Called "Kashmir of Andhra". Very cold in winter (Dec-Jan). Connectivity improving. Scenic tribal village.',
 ST_Point(82.4631, 17.9070)::geography),

-- ── Telangana ─────────────────────────────────────────────────────────────────
('Ananthagiri Hills',    'ananthagiri',  'Telangana',   700, 'hill_station',
 'Coffee trails, 90 km from Hyderabad. Forest homestays with decent 4G. Good weekend work retreat.',
 ST_Point(78.3500, 17.7200)::geography),

-- ── Pondicherry / coastal (bonus work destinations) ───────────────────────────
('Puducherry',           'puducherry',   'Puducherry',    6, 'coastal',
 'French Quarter, beach cafes, strong coworking scene. Excellent fiber via Airtel/BSNL. Year-round viable.',
 ST_Point(79.8083, 11.9416)::geography)

ON CONFLICT (slug) DO UPDATE SET
  category     = EXCLUDED.category,
  climate_notes = EXCLUDED.climate_notes,
  elevation_m  = EXCLUDED.elevation_m,
  location     = EXCLUDED.location;
