// Lightweight pulse skeletons shown while the Supabase community tab content
// streams in behind a Suspense boundary.

export function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-[var(--paper-deep)]" />
      <div className="h-40 animate-pulse rounded-2xl bg-[var(--paper-deep)]" />
    </div>
  )
}

export function StaysCommunitySkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-48 animate-pulse rounded bg-[var(--paper-deep)]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-[var(--paper-deep)]" />
        <div className="h-32 animate-pulse rounded-2xl bg-[var(--paper-deep)]" />
      </div>
    </div>
  )
}
