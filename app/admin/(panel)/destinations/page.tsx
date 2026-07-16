import { requireAdmin } from '@/lib/supabase/admin-guard'
import { getAllOverrides } from '@/lib/queries/admin'
import { DestinationsManager } from '@/components/admin/destinations-manager'
import { DESTINATIONS } from '@/lib/data/destinations'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Destinations' }

export default async function AdminDestinationsPage() {
  await requireAdmin()

  const overrides = await getAllOverrides()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">Destinations</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          All {DESTINATIONS.length} destinations still live in the static catalogue - that is why
          the site is fast and costs nothing to run. This page writes a thin override layer on top:
          anything you leave blank keeps using the catalogue default, and &ldquo;reset&rdquo; removes
          the override completely.
        </p>
      </div>

      <DestinationsManager overrides={overrides} />
    </div>
  )
}
