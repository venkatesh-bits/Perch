import { requireAdmin } from '@/lib/supabase/admin-guard'
import { getSiteSettingsUncached } from '@/lib/queries/site-settings'
import { SettingsManager } from '@/components/admin/settings-manager'
import { DESTINATIONS } from '@/lib/data/destinations'
import { heroBadgeDefault } from '@/lib/data/site-defaults'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Site settings' }

export default async function AdminSettingsPage() {
  await requireAdmin()

  const settings = await getSiteSettingsUncached()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-[var(--ink)]">Site settings</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
          Identity, type, colour and the front-page words. Every field here is an override on top of
          what the code already says: leave one blank and the built-in default is what visitors get,
          which is also what happens if this database is unreachable. Saving rebuilds the public
          pages, so a change shows up within a few seconds rather than on the next deploy.
        </p>
      </div>

      <SettingsManager
        settings={settings}
        // The catalogue count is resolved here so the 97 destinations never
        // travel to the browser just to render a placeholder.
        heroBadgeFallback={heroBadgeDefault(DESTINATIONS.length)}
      />
    </div>
  )
}
