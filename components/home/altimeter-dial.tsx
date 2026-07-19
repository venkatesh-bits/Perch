'use client'

import { useEffect, useState } from 'react'

/**
 * The hero's animated altimeter: a compass-style dial with a sweeping needle,
 * live-feeling (but honestly labelled) altitude/oxygen/temperature readout, and
 * two floating stat badges.
 *
 * The dial geometry (48 ticks, 4 major labels) is fixed - only the readout
 * numbers jitter, via a slow sine wave rather than random noise, so the motion
 * reads as "a real instrument settling" rather than flicker. That wobble is
 * cosmetic chrome around a real number (5,091 m, Zoji La to Shinku La on the
 * Kashmir circuit), not a live sensor reading - see the `wifiBadge` prop for
 * where an actual measurement is shown instead.
 */

interface Tick {
  x1: number
  y1: number
  x2: number
  y2: number
  major: boolean
}

const CX = 200
const CY = 200

function buildTicks(): Tick[] {
  return Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2
    const major = i % 4 === 0
    const r1 = major ? 148 : 154
    const r2 = 162
    return {
      x1: +(CX + r1 * Math.cos(a)).toFixed(1),
      y1: +(CY + r1 * Math.sin(a)).toFixed(1),
      x2: +(CX + r2 * Math.cos(a)).toFixed(1),
      y2: +(CY + r2 * Math.sin(a)).toFixed(1),
      major,
    }
  })
}

function buildLabels(): { x: number; y: number; t: string }[] {
  return [0, 1500, 3000, 4500].map((m, i) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2
    return { x: Math.round(CX + 134 * Math.cos(a)), y: Math.round(CY + 134 * Math.sin(a)) + 3, t: `${m}` }
  })
}

// Fixed dial geometry - no props/state feed it, so it's computed once at
// module load rather than memoized per render.
const TICKS = buildTicks()
const LABELS = buildLabels()

export function AltimeterDial({
  altitude,
  wifiBadge,
}: {
  /** The real elevation this dial centres on, e.g. Kashmir's Shinku La at 5,091 m. */
  altitude: number
  /** A real reading to show in the floating badge, or null to omit it entirely. */
  wifiBadge: { mbps: number; place: string } | null
}) {
  const [wobble, setWobble] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWobble(Math.sin(Date.now() / 5000) * 6)
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const shownAltitude = Math.round(altitude + wobble)
  const oxygenPct = Math.max(38, Math.round(100 - shownAltitude / 88))

  return (
    <div className="relative mx-auto w-full max-w-[400px] aspect-square">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <circle cx="200" cy="200" r="192" fill="none" stroke="rgba(233,228,218,0.08)" strokeWidth="1" />
        <g className="dial-ring" style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="176" fill="none" stroke="rgba(127,184,156,0.3)" strokeWidth="1" strokeDasharray="1 6" />
        </g>
        {TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? 'rgba(233,228,218,0.4)' : 'rgba(233,228,218,0.16)'}
            strokeWidth={t.major ? 1.4 : 1}
          />
        ))}
        {LABELS.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            fontSize="9.5"
            className="mono"
            fill="rgba(233,228,218,0.4)"
          >
            {l.t}
          </text>
        ))}
        <circle cx="200" cy="200" r="118" fill="rgba(233,228,218,0.03)" stroke="rgba(233,228,218,0.1)" strokeWidth="1" />
        <g className="dial-needle" style={{ transformOrigin: '200px 200px' }}>
          <line x1="200" y1="200" x2="200" y2="96" stroke="#E0A93B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="200" cy="200" r="5" fill="#E0A93B" />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="mono mt-[88px] text-[10px] uppercase tracking-[0.18em] text-[rgba(233,228,218,0.45)]">
          Altimeter
        </p>
        <p className="disp mt-0.5 text-[44px] text-[#F3EFE6]">
          {shownAltitude.toLocaleString()}
          <span className="text-[19px] text-[rgba(233,228,218,0.5)]"> m</span>
        </p>
        <p className="mono mt-0.5 text-[11px] text-[#7FB89C]">O₂ {oxygenPct}%</p>
      </div>

      {wifiBadge ? (
        <div className="absolute -right-1.5 top-3.5 rounded-lg border border-[rgba(127,184,156,0.3)] bg-[rgba(10,25,18,0.88)] px-2.5 py-1.5">
          <p className="mono m-0 text-[9px] uppercase tracking-[0.13em] text-[rgba(233,228,218,0.45)]">
            Last WiFi test
          </p>
          <p className="mono m-0 mt-0.5 text-[12.5px] text-[#E9E4DA]">
            {wifiBadge.mbps} Mbps ↓ · {wifiBadge.place}
          </p>
        </div>
      ) : null}

      <div className="absolute -left-1.5 bottom-6 rounded-lg border border-[rgba(224,169,59,0.35)] bg-[rgba(10,25,18,0.88)] px-2.5 py-1.5">
        <p className="mono m-0 text-[9px] uppercase tracking-[0.13em] text-[rgba(233,228,218,0.45)]">
          Road status
        </p>
        <p className="mono m-0 mt-0.5 text-[12.5px] text-[#E0A93B]">Check per destination →</p>
      </div>
    </div>
  )
}
