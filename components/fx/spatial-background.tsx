'use client'

import { useEffect, useRef } from 'react'

// Sparse starfield (a few radial dots tiled across the viewport).
const STARS =
  'radial-gradient(1.3px 1.3px at 25% 15%, rgba(255,255,255,.9), transparent),' +
  'radial-gradient(1px 1px at 68% 38%, rgba(255,255,255,.6), transparent),' +
  'radial-gradient(1.6px 1.6px at 45% 72%, rgba(255,255,255,.75), transparent),' +
  'radial-gradient(1px 1px at 85% 84%, rgba(255,255,255,.5), transparent),' +
  'radial-gradient(1.2px 1.2px at 12% 58%, rgba(180,205,255,.7), transparent),' +
  'radial-gradient(1px 1px at 55% 22%, rgba(255,255,255,.5), transparent),' +
  'radial-gradient(1.4px 1.4px at 92% 30%, rgba(210,200,255,.6), transparent)'

/**
 * Fixed, full-viewport spatial canvas: drifting aurora blobs, a receding grid
 * floor, a parallaxing starfield and a vignette. Sits behind all content. Pure
 * decoration (aria-hidden), and honours prefers-reduced-motion.
 */
export function SpatialBackground() {
  const starsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = starsRef.current
        if (el) el.style.backgroundPositionY = `${-window.scrollY * 0.25}px`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="fx-layer fx-aurora fx-aurora-1" />
      <div className="fx-layer fx-aurora fx-aurora-2" />
      <div className="fx-layer fx-aurora fx-aurora-3" />
      <div
        ref={starsRef}
        className="fx-layer fx-stars"
        style={{ backgroundImage: STARS, backgroundSize: '420px 420px' }}
      />
      <div className="fx-layer fx-grid" />
      <div className="fx-layer fx-vignette" />
    </div>
  )
}
