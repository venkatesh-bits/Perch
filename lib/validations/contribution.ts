import { z } from 'zod'

export const transportModes = ['car', 'bike', 'bus', 'train', 'mixed'] as const
export const wifiRatings = [1, 2, 3, 4, 5] as const

// ─── Step 1: Transport + route basics ────────────────────────────────────────

export const journeySchema = z.object({
  origin_name: z.string().min(2, 'Enter a starting point'),
  destination_slug: z.string().min(1, 'Select a destination'),
  transport_mode: z.enum(transportModes),
  trip_date: z.string().min(1, 'Date is required'),
  distance_km: z.coerce.number().positive().optional(),
  typical_duration_hours: z.coerce.number().positive().optional(),

  // Car / bike only
  fuel_stop_spacing_km: z.coerce.number().positive().optional(),
  has_ev_charging_stops: z.boolean().default(false),
  road_surface_rating: z.coerce.number().min(1).max(5).optional(),
  ghat_sections_count: z.coerce.number().int().min(0).default(0),
  ghat_warnings: z.string().max(500).optional(),

  // Bus / train only
  operator_name: z.string().max(100).optional(),
  schedule_reliability: z.enum(['very_reliable', 'mostly_reliable', 'unreliable']).optional(),
  booking_notes: z.string().max(500).optional(),
})

// ─── Step 2: Destination data ─────────────────────────────────────────────────

export const wifiReadingSchema = z.object({
  locality: z.string().max(100).optional(),
  download_mbps: z.coerce.number().min(0).max(10000),
  upload_mbps: z.coerce.number().min(0).max(10000).optional(),
  provider: z.string().max(50).optional(),
  test_tool: z.string().max(50).optional(),
})

export const accommodationSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['hotel', 'homestay', 'resort', 'hostel', 'service_apartment']).optional(),
  wifi_rating: z.coerce.number().min(1).max(5).optional(),
  wifi_notes: z.string().max(300).optional(),
  has_backup_power: z.boolean().default(false),
  price_range_inr: z.string().max(50).optional(),
})

export const workSpotSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['cafe', 'coworking', 'library', 'restaurant']).optional(),
  wifi_rating: z.coerce.number().min(1).max(5).optional(),
  power_outlets: z.enum(['plenty', 'some', 'few', 'none']).optional(),
  noise_level: z.enum(['quiet', 'moderate', 'noisy']).optional(),
  price_notes: z.string().max(200).optional(),
})

// ─── Full contribution form ───────────────────────────────────────────────────

export const contributionSchema = z.object({
  journey: journeySchema,
  wifi_reading: wifiReadingSchema.optional(),
  accommodation: accommodationSchema.optional(),
  work_spot: workSpotSchema.optional(),
  general_notes: z.string().max(1000).optional(),
})

export type ContributionFormData = z.infer<typeof contributionSchema>
export type JourneyFormData = z.infer<typeof journeySchema>
export type WifiReadingFormData = z.infer<typeof wifiReadingSchema>
export type AccommodationFormData = z.infer<typeof accommodationSchema>
export type WorkSpotFormData = z.infer<typeof workSpotSchema>
