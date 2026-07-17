export type TransportMode = 'car' | 'bike' | 'bus' | 'train' | 'mixed'
export type WifiRating = 1 | 2 | 3 | 4 | 5
export type PowerOutlets = 'plenty' | 'some' | 'few' | 'none'
export type NoiseLevel = 'quiet' | 'moderate' | 'noisy'
export type ScheduleReliability = 'very_reliable' | 'mostly_reliable' | 'unreliable'
export type ContributionStatus = 'pending' | 'approved' | 'rejected'
export type UpdateSentiment = 'still_good' | 'degraded' | 'improved' | 'closed'
export type UpdateCategory = 'wifi' | 'power' | 'accommodation' | 'cafe' | 'general'
export type WaypointType = 'fuel' | 'ev_charging' | 'food' | 'rest' | 'scenic' | 'caution' | 'toll'

export interface Destination {
  id: string
  name: string
  slug: string
  state: string
  elevation_m: number | null
  climate_notes: string | null
  created_at: string
  updated_at: string
}

export interface WifiReading {
  id: string
  destination_id: string
  locality: string | null
  download_mbps: number
  upload_mbps: number | null
  provider: string | null
  test_tool: string | null
  recorded_at: string
  contributed_by: string | null
  created_at: string
}

export interface Accommodation {
  id: string
  destination_id: string
  name: string
  type: 'hotel' | 'homestay' | 'resort' | 'hostel' | 'service_apartment' | null
  wifi_rating: WifiRating | null
  wifi_notes: string | null
  has_backup_power: boolean
  price_range_inr: string | null
  contributed_by: string | null
  created_at: string
}

export interface WorkSpot {
  id: string
  destination_id: string
  name: string
  type: 'cafe' | 'coworking' | 'library' | 'restaurant' | null
  wifi_rating: WifiRating | null
  power_outlets: PowerOutlets | null
  noise_level: NoiseLevel | null
  opens_at: string | null
  closes_at: string | null
  price_notes: string | null
  contributed_by: string | null
  created_at: string
}

export interface PowerReport {
  id: string
  destination_id: string
  locality: string | null
  cuts_per_week_estimate: number | null
  typical_duration_minutes: number | null
  has_inverter_backup: boolean | null
  notes: string | null
  reported_at: string
  created_at: string
}

export interface Journey {
  id: string
  origin_name: string
  destination_id: string
  transport_mode: TransportMode
  distance_km: number | null
  typical_duration_hours: number | null

  // Car / bike
  fuel_stop_spacing_km: number | null
  has_ev_charging_stops: boolean
  road_surface_rating: WifiRating | null
  ghat_sections_count: number
  ghat_warnings: string | null

  // Bus / train
  operator_name: string | null
  schedule_reliability: ScheduleReliability | null
  booking_notes: string | null

  contributed_by: string | null
  created_at: string
  updated_at: string
}

export interface Waypoint {
  id: string
  journey_id: string
  type: WaypointType
  name: string | null
  notes: string | null
  order_index: number
  created_at: string
}

export interface Contribution {
  id: string
  contributor_id: string | null
  journey_id: string | null
  destination_id: string | null
  trip_date: string
  notes: string | null
  status: ContributionStatus
  created_at: string
}

export interface DestinationUpdate {
  id: string
  destination_id: string
  contributor_id: string | null
  category: UpdateCategory
  sentiment: UpdateSentiment
  notes: string | null
  reported_at: string
  created_at: string
}

// View type
export interface DestinationWifiSummary {
  destination_id: string
  reading_count: number
  avg_download_mbps: number | null
  median_download_mbps: number | null
  last_reading_at: string | null
}

// Joined types used across pages
export interface DestinationWithWifi extends Destination {
  wifi_summary?: DestinationWifiSummary
  journey_count?: number
}

export interface JourneyWithDestination extends Journey {
  destination: Destination
  waypoints?: Waypoint[]
}

// ─── Admin CMS layer (migration 004) ─────────────────────────────────────────

export type TripMediaKind = 'photo' | 'video'

/** A photo or video on a trip log page. `day` null = general gallery. */
export interface TripMedia {
  id: string
  trip_slug: string
  day: number | null
  kind: TripMediaKind
  url: string
  caption: string | null
  sort: number
  created_at: string
}

export interface Post {
  id: string
  slug: string
  title: string
  body: string | null
  cover_url: string | null
  published: boolean
  created_at: string
  updated_at: string
}

/**
 * Per-field overrides merged OVER the static destination catalogue.
 * A null field means "keep the static default".
 */
export interface DestinationOverride {
  slug: string
  summary: string | null
  image_url: string | null
  remote_work_note: string | null
  updated_at: string
}

// ─── Site settings (migration 005) ───────────────────────────────────────────

/**
 * The single `site_settings` row: the owner's overrides for identity, type,
 * theme and front-page copy.
 *
 * Every field is nullable and null means "use the default in
 * lib/data/site-defaults.ts". `id` is always true - the table is pinned to one
 * row by a check constraint.
 */
export interface SiteSettings {
  id: boolean

  site_title: string | null
  tagline: string | null
  meta_description: string | null

  /** Curated keys from lib/data/fonts.ts, never family names or URLs. */
  font_display: string | null
  font_body: string | null

  color_brand: string | null
  color_brand_deep: string | null
  color_brand_mint: string | null
  color_brand_gold: string | null
  color_paper: string | null
  color_ink: string | null
  color_ink_soft: string | null
  color_line: string | null
  color_surface: string | null
  color_clay: string | null

  hero_badge: string | null
  hero_title: string | null
  hero_title_accent: string | null
  hero_subhead: string | null
  featured_heading: string | null
  featured_eyebrow: string | null
  ev_heading: string | null
  ev_body: string | null
  cta_heading: string | null
  cta_body: string | null
  footer_blurb: string | null
  about_blurb: string | null

  updated_at: string | null
}
