import type { WorkSpot } from '@/lib/types/database'
import { WorkSpotCard, EmptyState } from './ui'

interface Props {
  slug: string
  workSpots: WorkSpot[]
}

// Work spots tab. Renders the Supabase community work-spot layer.
export function WorkSpotsTab({ slug, workSpots }: Props) {
  return workSpots?.length ? (
    <div className="grid gap-4 sm:grid-cols-2">
      {workSpots.map((w) => <WorkSpotCard key={w.id} spot={w} />)}
    </div>
  ) : (
    <EmptyState icon="💻" title="No work spots yet" text="Worked from a cafe or coworking space here? Add it so others can find it." slug={slug} cta="Add a work spot" />
  )
}
