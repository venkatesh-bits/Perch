import { type OsmStay, STAY_TYPE_LABELS, STAY_TYPE_ICONS, stayMapsLink } from '@/lib/data/stays'

export function StayCard({ stay, showDistance = true }: { stay: OsmStay; showDistance?: boolean }) {
  return (
    <div className="card card-hover flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--ink)]">{stay.name}</p>
          <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
            {STAY_TYPE_ICONS[stay.type]} {STAY_TYPE_LABELS[stay.type]} · {stay.area}
          </p>
        </div>
        {stay.stars ? (
          <span className="shrink-0 rounded-md bg-[var(--brand-gold)]/15 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--brand-gold)]">
            {'★'.repeat(stay.stars)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {stay.hasInternet ? (
          <span className="rounded-md bg-[var(--brand)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--brand)]">
            📶 WiFi listed
          </span>
        ) : null}
        {showDistance ? (
          <span className="rounded-md bg-[var(--paper-deep)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)]">
            {stay.distanceToDestKm <= 0 ? 'In town' : `~${stay.distanceToDestKm} km away`}
          </span>
        ) : null}
        <span className="rounded-md bg-[var(--paper-deep)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)]">
          {stay.state}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <a
          href={stayMapsLink(stay)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--brand-deep)]"
        >
          Map ↗
        </a>
        {stay.website ? (
          <a
            href={stay.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-mint)]"
          >
            Website ↗
          </a>
        ) : null}
        {stay.phone ? (
          <a
            href={`tel:${stay.phone}`}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-mint)]"
          >
            Call
          </a>
        ) : null}
      </div>
    </div>
  )
}
