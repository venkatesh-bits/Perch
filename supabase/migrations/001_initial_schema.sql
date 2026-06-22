-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── DESTINATIONS ────────────────────────────────────────────────────────────

CREATE TABLE destinations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  state        TEXT NOT NULL,
  elevation_m  INTEGER,
  climate_notes TEXT,
  location     GEOGRAPHY(POINT, 4326),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WIFI READINGS (crowdsourced) ────────────────────────────────────────────

CREATE TABLE wifi_readings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id   UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  locality         TEXT,
  download_mbps    NUMERIC(6,2) NOT NULL,
  upload_mbps      NUMERIC(6,2),
  provider         TEXT,
  test_tool        TEXT,
  location         GEOGRAPHY(POINT, 4326),
  recorded_at      TIMESTAMPTZ NOT NULL,
  contributed_by   UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACCOMMODATIONS ──────────────────────────────────────────────────────────

CREATE TABLE accommodations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id   UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             TEXT CHECK (type IN ('hotel','homestay','resort','hostel','service_apartment')),
  wifi_rating      INTEGER CHECK (wifi_rating BETWEEN 1 AND 5),
  wifi_notes       TEXT,
  has_backup_power BOOLEAN DEFAULT FALSE,
  price_range_inr  TEXT,
  location         GEOGRAPHY(POINT, 4326),
  contributed_by   UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WORK SPOTS (cafes / coworking) ──────────────────────────────────────────

CREATE TABLE work_spots (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id   UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             TEXT CHECK (type IN ('cafe','coworking','library','restaurant')),
  wifi_rating      INTEGER CHECK (wifi_rating BETWEEN 1 AND 5),
  power_outlets    TEXT CHECK (power_outlets IN ('plenty','some','few','none')),
  noise_level      TEXT CHECK (noise_level IN ('quiet','moderate','noisy')),
  opens_at         TIME,
  closes_at        TIME,
  price_notes      TEXT,
  location         GEOGRAPHY(POINT, 4326),
  contributed_by   UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── POWER RELIABILITY ───────────────────────────────────────────────────────

CREATE TABLE power_reports (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id            UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  locality                  TEXT,
  cuts_per_week_estimate    INTEGER,
  typical_duration_minutes  INTEGER,
  has_inverter_backup       BOOLEAN,
  notes                     TEXT,
  reported_at               TIMESTAMPTZ NOT NULL,
  contributed_by            UUID REFERENCES auth.users(id),
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ─── JOURNEYS ────────────────────────────────────────────────────────────────

CREATE TABLE journeys (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_name           TEXT NOT NULL,
  destination_id        UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  transport_mode        TEXT NOT NULL CHECK (transport_mode IN ('car','bike','bus','train','mixed')),
  distance_km           NUMERIC(7,2),
  typical_duration_hours NUMERIC(5,2),
  route_line            GEOGRAPHY(LINESTRING, 4326),

  -- Car / bike fields
  fuel_stop_spacing_km  NUMERIC(6,2),
  has_ev_charging_stops BOOLEAN DEFAULT FALSE,
  road_surface_rating   INTEGER CHECK (road_surface_rating BETWEEN 1 AND 5),
  ghat_sections_count   INTEGER DEFAULT 0,
  ghat_warnings         TEXT,

  -- Bus / train fields
  operator_name         TEXT,
  schedule_reliability  TEXT CHECK (schedule_reliability IN ('very_reliable','mostly_reliable','unreliable')),
  booking_notes         TEXT,

  contributed_by        UUID REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WAYPOINTS ───────────────────────────────────────────────────────────────

CREATE TABLE waypoints (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journey_id   UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('fuel','ev_charging','food','rest','scenic','caution','toll')),
  name         TEXT,
  notes        TEXT,
  location     GEOGRAPHY(POINT, 4326) NOT NULL,
  order_index  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTRIBUTIONS (unified form submissions) ─────────────────────────────────

CREATE TABLE contributions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contributor_id UUID REFERENCES auth.users(id),
  journey_id     UUID REFERENCES journeys(id),
  destination_id UUID REFERENCES destinations(id),
  trip_date      DATE NOT NULL,
  notes          TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LIGHTWEIGHT UPDATES ("still good" reports) ───────────────────────────────

CREATE TABLE destination_updates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES auth.users(id),
  category       TEXT NOT NULL CHECK (category IN ('wifi','power','accommodation','cafe','general')),
  sentiment      TEXT NOT NULL CHECK (sentiment IN ('still_good','degraded','improved','closed')),
  notes          TEXT,
  reported_at    TIMESTAMPTZ NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_wifi_readings_destination  ON wifi_readings(destination_id);
CREATE INDEX idx_wifi_readings_recorded_at  ON wifi_readings(recorded_at DESC);
CREATE INDEX idx_accommodations_destination ON accommodations(destination_id);
CREATE INDEX idx_work_spots_destination     ON work_spots(destination_id);
CREATE INDEX idx_journeys_destination       ON journeys(destination_id);
CREATE INDEX idx_journeys_mode              ON journeys(transport_mode);
CREATE INDEX idx_waypoints_journey          ON waypoints(journey_id, order_index);
CREATE INDEX idx_contributions_contributor  ON contributions(contributor_id);
CREATE INDEX idx_dest_updates_destination   ON destination_updates(destination_id, created_at DESC);

-- Spatial indexes
CREATE INDEX idx_destinations_location  ON destinations  USING GIST(location);
CREATE INDEX idx_wifi_readings_location ON wifi_readings USING GIST(location);
CREATE INDEX idx_work_spots_location    ON work_spots    USING GIST(location);
CREATE INDEX idx_journeys_route         ON journeys      USING GIST(route_line);
CREATE INDEX idx_waypoints_location     ON waypoints     USING GIST(location);

-- ─── AGGREGATED VIEW ─────────────────────────────────────────────────────────

CREATE VIEW destination_wifi_summary AS
SELECT
  destination_id,
  COUNT(*)                                                          AS reading_count,
  ROUND(AVG(download_mbps)::numeric, 1)                           AS avg_download_mbps,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY download_mbps)      AS median_download_mbps,
  MAX(recorded_at)                                                  AS last_reading_at
FROM wifi_readings
GROUP BY destination_id;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE destinations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wifi_readings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_spots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE waypoints          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_updates ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "public_read" ON destinations        FOR SELECT USING (true);
CREATE POLICY "public_read" ON wifi_readings       FOR SELECT USING (true);
CREATE POLICY "public_read" ON accommodations      FOR SELECT USING (true);
CREATE POLICY "public_read" ON work_spots          FOR SELECT USING (true);
CREATE POLICY "public_read" ON power_reports       FOR SELECT USING (true);
CREATE POLICY "public_read" ON journeys            FOR SELECT USING (true);
CREATE POLICY "public_read" ON waypoints           FOR SELECT USING (true);
CREATE POLICY "public_read" ON destination_updates FOR SELECT USING (true);

-- Authenticated inserts - each row is owned by the submitter
CREATE POLICY "auth_insert" ON wifi_readings       FOR INSERT WITH CHECK (auth.uid() = contributed_by);
CREATE POLICY "auth_insert" ON accommodations      FOR INSERT WITH CHECK (auth.uid() = contributed_by);
CREATE POLICY "auth_insert" ON work_spots          FOR INSERT WITH CHECK (auth.uid() = contributed_by);
CREATE POLICY "auth_insert" ON power_reports       FOR INSERT WITH CHECK (auth.uid() = contributed_by);
CREATE POLICY "auth_insert" ON journeys            FOR INSERT WITH CHECK (auth.uid() = contributed_by);
CREATE POLICY "auth_insert" ON contributions       FOR INSERT WITH CHECK (auth.uid() = contributor_id);
CREATE POLICY "auth_insert" ON destination_updates FOR INSERT WITH CHECK (auth.uid() = contributor_id);

-- ─── SEED DATA: first corridor ───────────────────────────────────────────────

INSERT INTO destinations (name, slug, state, elevation_m, climate_notes, location) VALUES
  ('Coonoor',  'coonoor',  'Tamil Nadu', 1858, 'Cool year-round. Mist common Nov-Jan. Dry season Mar-May best for work.', ST_Point(76.7959, 11.3530)::geography),
  ('Ooty',     'ooty',     'Tamil Nadu', 2240, 'Cold nights even in summer. Heavy tourist season Apr-Jun and Oct-Nov.', ST_Point(76.6950, 11.4102)::geography),
  ('Kodaikanal','kodaikanal','Tamil Nadu', 2133, 'Pleasant May-Jun and Sep-Oct. Fog limits visibility Jun-Aug.',           ST_Point(77.4892, 10.2381)::geography),
  ('Tenkasi',  'tenkasi',  'Tamil Nadu',  170, 'Gateway to Courtallam falls. Hot plains climate, cooler forest areas.',   ST_Point(77.3151,  8.9606)::geography),
  ('Chennai',  'chennai',  'Tamil Nadu',    6, 'Major origin hub - not a remote-work destination.',                        ST_Point(80.2707, 13.0827)::geography);
