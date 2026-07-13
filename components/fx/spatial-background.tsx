/**
 * Soft pastel aurora washes (mint / heather / gold) drifting slowly behind the
 * light paper UI. Fixed, full-viewport, pure decoration (aria-hidden); the
 * animation is disabled by the prefers-reduced-motion rule in globals.css.
 */
export function SpatialBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="fx-layer fx-aurora fx-aurora-1" />
      <div className="fx-layer fx-aurora fx-aurora-2" />
      <div className="fx-layer fx-aurora fx-aurora-3" />
    </div>
  )
}
