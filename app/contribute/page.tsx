import ContributeForm from '@/components/contribute/contribute-form'
import { DESTINATIONS } from '@/lib/data/destinations'

export const metadata = {
  title: 'Add a trip report',
  description: 'One short form populates both the destination guide and the journey guide.',
}

export default async function ContributePage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>
}) {
  const { destination: prefillSlug } = await searchParams

  const destinations = DESTINATIONS.map((d) => ({ slug: d.slug, name: d.name, state: d.state }))

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-[var(--ink)]">Add a trip report</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          One form, two guides. Your visit populates both the destination guide and the journey
          guide. It takes about three minutes.
        </p>
      </div>
      <ContributeForm destinations={destinations} prefillSlug={prefillSlug} />
    </div>
  )
}
