'use client'

import dynamic from 'next/dynamic'

// Defer the MapLibre bundle (~200KB) until the client renders the EV explorer.
// ssr:false requires a Client Component, so the charging page (a Server
// Component) renders this wrapper instead of EvExplorer directly.
const EvExplorer = dynamic(
  () => import('./ev-explorer').then((mod) => mod.EvExplorer),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="h-[440px] animate-pulse rounded-3xl bg-[var(--paper-deep)]" />
      </div>
    ),
  },
)

export function EvExplorerLazy() {
  return <EvExplorer />
}
