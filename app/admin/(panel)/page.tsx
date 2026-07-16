import Link from 'next/link'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { getAllOverrides, getAllPosts, getAllTripMedia } from '@/lib/queries/admin'
import { DESTINATIONS } from '@/lib/data/destinations'

export const dynamic = 'force-dynamic'

const CARDS = [
  {
    href: '/admin/trip-media',
    title: 'Trip media',
    blurb: 'Photos and videos for the Kashmir log. Pin them to a day or drop them in the general gallery.',
  },
  {
    href: '/admin/posts',
    title: 'Posts',
    blurb: 'Write-ups with a cover image. Drafts stay invisible to everyone but you until you publish.',
  },
  {
    href: '/admin/destinations',
    title: 'Destinations',
    blurb: 'Override the summary, work note or photo on any of the static catalogue entries.',
  },
]

export default async function AdminDashboard() {
  // Re-checked here, not inherited from the layout.
  await requireAdmin()

  const [media, posts, overrides] = await Promise.all([
    getAllTripMedia('kashmir'),
    getAllPosts(),
    getAllOverrides(),
  ])

  const published = posts.filter((p) => p.published).length

  const stats = [
    { n: media.length, l: 'trip media items' },
    { n: `${published}/${posts.length}`, l: 'posts published' },
    { n: `${Object.keys(overrides).length}/${DESTINATIONS.length}`, l: 'destinations overridden' },
  ]

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex flex-wrap gap-10">
          {stats.map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl text-[var(--ink)]">{s.n}</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover block p-5">
            <h2 className="font-display text-xl tracking-tight text-[var(--ink)]">{c.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">{c.blurb}</p>
            <p className="mt-3 text-xs font-medium text-[var(--brand)]">Open →</p>
          </Link>
        ))}
      </section>

      <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
        <span className="font-semibold text-[var(--ink)]">How this is locked down.</span>{' '}
        Only the anon key ever reaches your browser. Every write here is checked twice: once by{' '}
        <code>requireAdmin()</code> in the server action, and once by row level security in
        Postgres calling <code>is_admin()</code>. If someone got hold of the anon key and hand-rolled
        a request, the database would still refuse it.
      </p>
    </div>
  )
}
