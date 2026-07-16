import Image from 'next/image'
import { parseVideoUrl, videoEmbedUrl } from '@/lib/validations/admin'
import type { TripMedia } from '@/lib/types/database'

/**
 * Rendering for owner-uploaded trip media.
 *
 * Everything here is defensive: a URL that no longer parses (a video link that
 * was valid when saved but is not now) renders nothing rather than an empty
 * frame. With no media at all, every component returns null and /kashmir looks
 * exactly as it did before the CMS existed.
 */

function Caption({ text }: { text: string | null }) {
  if (!text?.trim()) return null
  return <figcaption className="mt-1.5 text-[11px] leading-relaxed text-[var(--ink-soft)]">{text}</figcaption>
}

/** A single video: an iframe embed for YouTube/Vimeo, <video> for our own files. */
export function TripVideo({ item }: { item: TripMedia }) {
  const src = parseVideoUrl(item.url)
  if (!src) return null

  if (src.kind === 'file') {
    return (
      <figure>
        <video
          controls
          preload="metadata"
          className="aspect-video w-full rounded-xl bg-[var(--paper-deep)] object-cover"
          src={src.url}
        >
          <track kind="captions" />
        </video>
        <Caption text={item.caption} />
      </figure>
    )
  }

  const embed = videoEmbedUrl(src)
  if (!embed) return null

  return (
    <figure>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[var(--paper-deep)]">
        <iframe
          src={embed}
          title={item.caption ?? 'Trip video'}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <Caption text={item.caption} />
    </figure>
  )
}

/** A single photo. */
export function TripPhoto({ item, sizes }: { item: TripMedia; sizes: string }) {
  return (
    <figure>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--paper-deep)]">
        <Image
          src={item.url}
          alt={item.caption ?? 'Photo from the trip'}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
      <Caption text={item.caption} />
    </figure>
  )
}

function TripMediaItem({ item, sizes }: { item: TripMedia; sizes: string }) {
  return item.kind === 'video' ? <TripVideo item={item} /> : <TripPhoto item={item} sizes={sizes} />
}

/**
 * The small gallery inside a day's card. Renders nothing when that day has no
 * media, which is the normal state for most days.
 */
export function DayMedia({ items }: { items: TripMedia[] | undefined }) {
  if (!items?.length) return null

  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map((m) => (
        <TripMediaItem key={m.id} item={m} sizes="(max-width: 640px) 45vw, 180px" />
      ))}
    </div>
  )
}

/** The "From the road" section: media not pinned to any day. */
export function GeneralMediaGallery({ items }: { items: TripMedia[] }) {
  if (!items.length) return null

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
          The rest of it
        </p>
        <h2 className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
          From the road
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
          Shots that do not belong to any one day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <TripMediaItem key={m.id} item={m} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px" />
        ))}
      </div>
    </section>
  )
}
