/** Route-level loading UI, shown while a server segment streams in. */
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-4 px-5">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand)]"
        role="status"
        aria-label="Loading"
      />
      <p className="font-display text-lg italic text-[var(--ink-soft)]">Finding your perch…</p>
    </div>
  )
}
