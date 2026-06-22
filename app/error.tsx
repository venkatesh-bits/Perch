'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Root error boundary. Catches unexpected runtime errors in any route segment
 * and offers recovery. Uses Next 16.2's `unstable_retry` to re-fetch + re-render.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    // In production this is where you'd report to an error service.
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="text-4xl">🪶</p>
      <h1 className="font-display text-3xl tracking-tight text-[var(--ink)]">Something came loose.</h1>
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        An unexpected error interrupted this page. You can try again, or head back home.
        {error.digest ? <span className="mt-1 block text-xs opacity-60">Reference: {error.digest}</span> : null}
      </p>
      <div className="flex gap-3">
        <button onClick={() => unstable_retry()} className="btn-primary text-sm">
          Try again
        </button>
        <Link href="/" className="btn-ghost text-sm">
          Go home
        </Link>
      </div>
    </div>
  )
}
