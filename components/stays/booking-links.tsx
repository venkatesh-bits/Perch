import { bookingSearchLinks } from '@/lib/data/stays'

/**
 * Legal outbound deep-links to each provider's own search for a place.
 * We link to their live inventory; we never copy listings.
 */
export function BookingLinks({ place, compact = false }: { place: string; compact?: boolean }) {
  const links = bookingSearchLinks(place)
  return (
    <div className={compact ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap gap-2'}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-mint)] hover:text-[var(--brand)] ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          }`}
        >
          {l.label} ↗
        </a>
      ))}
    </div>
  )
}
