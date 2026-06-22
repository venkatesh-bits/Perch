import Link from 'next/link'

/** Branded 404 shown for unknown routes and for notFound() calls. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-display text-6xl text-[var(--brand)]">404</p>
      <h1 className="font-display text-3xl tracking-tight text-[var(--ink)]">No perch here.</h1>
      <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
        That page flew off. Try browsing destinations, stays or the EV charging map instead.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/destinations" className="btn-primary text-sm">Browse destinations</Link>
        <Link href="/" className="btn-ghost text-sm">Go home</Link>
      </div>
    </div>
  )
}
