'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-reveal wrapper: fades + lifts its children into view the first time
 * they cross the viewport. Falls back to instantly visible when reduced-motion
 * is requested or IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // No IntersectionObserver (very old browsers): reveal on next frame. Reduced
    // motion is handled in CSS, which forces .reveal visible regardless of state.
    if (typeof IntersectionObserver === 'undefined') {
      const id = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShow(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-show={show}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
