import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'Perch - Work from anywhere. Worry about nothing.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand palette (kept inline; next/og does not read CSS variables).
const PAPER = '#F7F4EF'
const PINE = '#1C5240'
const INK = '#1A1714'
const INK_SOFT = '#6B6259'
const GOLD = '#C9982B'

// Static, dependency-free social card. System font only - no external fonts or
// images, so it stays keyless and works offline at build time.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '72px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: PINE,
              display: 'flex',
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 600, color: PINE, letterSpacing: '-0.02em' }}>
            perch
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: INK, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Work from anywhere.
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, color: PINE, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Worry about nothing.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: INK_SOFT, maxWidth: 880, lineHeight: 1.35 }}>
            Community-verified WiFi, work cafes, ghat road conditions, stays and EV charging across South India.
          </div>
        </div>

        {/* Footer accent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: GOLD, display: 'flex' }} />
          <div style={{ fontSize: 24, color: INK_SOFT }}>
            South India remote-work and road-trip planner
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
