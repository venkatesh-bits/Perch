'use client'

import { useRef } from 'react'

/**
 * 3D tilt-on-hover wrapper. Tracks the cursor and rotates its child in
 * perspective via CSS vars (--rx / --ry consumed by the .tilt class). The child
 * should stretch to fill (h-full). No-op for touch / reduced-motion users since
 * it only reacts to mouse movement.
 */
export function Tilt({
  children,
  className = '',
  max = 7,
}: {
  children: React.ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${px * max}deg`)
    el.style.setProperty('--ry', `${-py * max}deg`)
  }

  function reset() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </div>
  )
}
