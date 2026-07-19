/**
 * The scrolling strip of real stats under the hero. Every entry is data the
 * homepage already has to hand - wifi readings, elevation, EV network count,
 * wildlife corridors - reused rather than invented, unlike the mockup's
 * placeholder feed. Reuses the existing `.marquee-track` keyframe/class from
 * globals.css instead of a page-local duplicate.
 */
export function TelemetryTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-mask relative z-10 overflow-hidden border-y border-white/10 bg-black/15 py-3">
      <div className="marquee-track mono flex gap-10 text-xs text-white/45">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {item}
            <span className="text-[#E0A93B]/50">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
